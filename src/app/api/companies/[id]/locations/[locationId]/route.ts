import { NextResponse } from "next/server";
import { getAuthUser } from "@/utils";
import { deleteLocation } from "@/lib/supabase/locations/queries";
import { getCompanyWithAllSubscriptions } from "@/lib/supabase/companies/queries";
import { updateSubscription } from "@/lib/supabase/subscriptions/queries";
import { PLANS, PlanId } from "@/config/pricing";
import { Stripe } from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-11-17.clover",
});

interface CompanySubscription {
    id: string;
    is_active: boolean;
    type: string;
    stripe_subscription_id: string;
    stripe_item_id_location: string | null;
}

interface CompanyWithBilling {
    id: string;
    current_plan: string;
    subscription_status: string | null;
    location_count: number;
    stripe_customer_id: string;
    subscriptions: CompanySubscription[];
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string; locationId: string }> }
) {
    try {
        await getAuthUser();
        const { id: companyId, locationId } = await params;

        console.log("[DELETE LOCATION API] Request started", {
            companyId,
            locationId,
        });

        // =========================================================
        // 1. FETCH COMPANY DATA FOR BILLING CHECK
        // =========================================================
        const company = (await getCompanyWithAllSubscriptions(
            companyId
        )) as unknown as CompanyWithBilling;

        console.log("[DELETE LOCATION API] Company data fetched", {
            companyId: company.id,
            currentPlan: company.current_plan,
            locationCount: company.location_count,
        });

        const currentPlanId = company.current_plan as PlanId;
        const planConfig = PLANS[currentPlanId];

        // =========================================================
        // 2. CHECK IF DELETION AFFECTS OVERAGE BILLING
        // =========================================================
        if (planConfig) {
            const locationLimit = planConfig.limits.locations;
            const currentCount = company.location_count || 0;

            console.log("[DELETE LOCATION BILLING] Checking overage status", {
                currentCount,
                locationLimit,
                isBeyondLimit: currentCount > locationLimit,
            });

            // If current count is beyond the limit, we need to reduce Stripe overage charges
            if (currentCount > locationLimit) {
                const newQuantity = Math.max(0, currentCount - 1 - locationLimit);
                const usagePriceId = planConfig.stripe.usage.location;

                console.log("[DELETE LOCATION BILLING] Overage detected, updating Stripe", {
                    currentCount,
                    limit: locationLimit,
                    newQuantity,
                    usagePriceId,
                });

                const activeSubs = company.subscriptions.filter((s) => s.is_active);

                console.log("[DELETE LOCATION BILLING] Active subscriptions found", {
                    count: activeSubs.length,
                });

                let targetItemId: string | undefined;

                // A. Find existing usage item
                for (const sub of activeSubs) {
                    if (sub.stripe_item_id_location) {
                        targetItemId = sub.stripe_item_id_location;
                        console.log("[DELETE LOCATION BILLING] Found existing usage item in DB", {
                            subscriptionId: sub.id,
                            itemId: targetItemId,
                        });
                        break;
                    }

                    // Fallback: Check Stripe
                    console.log("🔍 [DELETE LOCATION BILLING] Checking Stripe for usage item", {
                        subscriptionId: sub.id,
                        stripeSubId: sub.stripe_subscription_id,
                    });

                    const stripeSub = await stripe.subscriptions.retrieve(
                        sub.stripe_subscription_id
                    );
                    const item = stripeSub.items.data.find(
                        (i) => i.price.id === usagePriceId
                    );

                    if (item) {
                        targetItemId = item.id;
                        console.log(
                            "[DELETE LOCATION BILLING] Found usage item in Stripe, updating DB",
                            {
                                itemId: item.id,
                                quantity: item.quantity,
                            }
                        );

                        await updateSubscription(sub.id, { stripe_item_id_location: item.id });
                        break;
                    }
                }

                // B. Update or Remove Stripe Item
                try {
                    if (targetItemId) {
                        if (newQuantity === 0) {
                            // Remove the item entirely if quantity would be 0
                            console.log("[DELETE LOCATION BILLING] Removing Stripe item (quantity = 0)", {
                                itemId: targetItemId,
                            });

                            await stripe.subscriptionItems.del(targetItemId, {
                                proration_behavior: "always_invoice",
                            });

                            // Clear the item ID from the database
                            const subToUpdate = activeSubs.find(
                                (s) => s.stripe_item_id_location === targetItemId
                            );
                            if (subToUpdate) {
                                await updateSubscription(subToUpdate.id, {
                                    stripe_item_id_location: null,
                                });
                            }

                            console.log("[DELETE LOCATION BILLING] Successfully removed Stripe item");
                        } else {
                            // Update the quantity
                            console.log("[DELETE LOCATION BILLING] Updating existing Stripe item", {
                                itemId: targetItemId,
                                newQuantity,
                            });

                            await stripe.subscriptionItems.update(targetItemId, {
                                quantity: newQuantity,
                                proration_behavior: "always_invoice",
                            });

                            console.log(
                                "[DELETE LOCATION BILLING] Successfully updated Stripe item",
                                {
                                    itemId: targetItemId,
                                    quantity: newQuantity,
                                }
                            );
                        }
                    } else {
                        console.warn(
                            "[DELETE LOCATION BILLING] No usage item found, but location was beyond limit"
                        );
                    }
                } catch (stripeError: unknown) {
                    const msg =
                        stripeError instanceof Error
                            ? stripeError.message
                            : "Unknown Stripe Error";

                    console.error("[DELETE LOCATION BILLING] Stripe error occurred", {
                        error: msg,
                        errorType:
                            stripeError instanceof Error
                                ? stripeError.constructor.name
                                : typeof stripeError,
                        stack: stripeError instanceof Error ? stripeError.stack : undefined,
                    });

                    // FAIL the deletion to maintain consistency between Stripe and database
                    throw new Error(`Failed to update billing: ${msg}`);
                }
            } else {
                console.log(
                    "[DELETE LOCATION BILLING] Within limit, no overage charges to update"
                );
            }
        } else {
            console.warn(
                "[DELETE LOCATION BILLING] No plan config found, skipping billing"
            );
        }

        // =========================================================
        // 3. DELETE THE LOCATION
        // =========================================================
        await deleteLocation(locationId, companyId);

        console.log("[DELETE LOCATION API] Location deleted successfully");

        return NextResponse.json(
            { message: "Location deleted successfully" },
            { status: 200 }
        );
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Unknown Error";

        console.error("[DELETE LOCATION API] Request failed", {
            error: msg,
            errorType: error instanceof Error ? error.constructor.name : typeof error,
            stack: error instanceof Error ? error.stack : undefined,
        });

        if (msg === "Unauthorized") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        return NextResponse.json(
            { error: msg || "Failed to delete location" },
            { status: 400 }
        );
    }
}
