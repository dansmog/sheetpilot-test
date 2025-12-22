import { NextResponse } from "next/server";
import { getAuthUser } from "@/utils";
import {
  getLocations,
  createLocation,
  CreateLocationData,
} from "@/lib/supabase/locations/queries";
import { getCompanyWithAllSubscriptions } from "@/lib/supabase/companies/queries";
import { updateSubscription } from "@/lib/supabase/subscriptions/queries";
import { addLocationSchema } from "@/utils/validation-schemas/location.schema";
import { hasActivePlan, canCreateResource } from "@/lib/subscription/plans";
import { Stripe } from "stripe";
import { PLANS, PlanId } from "@/config/pricing";

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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await getAuthUser();
    const { id: companyId } = await params;
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("activeOnly") === "true";

    const locations = await getLocations(companyId, activeOnly);

    return NextResponse.json({ locations });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to fetch locations" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await getAuthUser();
    const { id: companyId } = await params;
    const body = await request.json();

    console.log("🚀 [LOCATION API] POST request started", {
      companyId,
      locationName: body.name,
    });

    // 1. Validate Input
    const validatedData = addLocationSchema.parse({
      ...body,
      company_id: companyId,
    });

    console.log("[LOCATION API] Input validated successfully");

    // =========================================================
    // 2. START SUBSCRIPTION CHECK
    // =========================================================

    console.log("🔍 [LOCATION API] Fetching company data");

    // Fetch company with subscription info
    const company = (await getCompanyWithAllSubscriptions(
      companyId
    )) as unknown as CompanyWithBilling;

    console.log("[LOCATION API] Company data fetched", {
      companyId: company.id,
      currentPlan: company.current_plan,
      subscriptionStatus: company.subscription_status,
      locationCount: company.location_count,
      subscriptionsCount: company.subscriptions?.length || 0,
    });

    // Check if company has an active plan (NO PLAN = NO ACCESS)
    const hasActive = hasActivePlan(
      company.current_plan,
      company.subscription_status
    );

    console.log("[LOCATION API] Active plan check", {
      hasActivePlan: hasActive,
      currentPlan: company.current_plan,
      subscriptionStatus: company.subscription_status,
    });

    if (!hasActive) {
      console.warn(" [LOCATION API] No active plan, blocking creation");
      return NextResponse.json(
        { error: "Active subscription required to create locations" },
        { status: 403 }
      );
    }

    // Check if company can create more locations based on plan limits
    const canCreate = canCreateResource(
      "location",
      company.location_count,
      company.current_plan,
      company.subscription_status
    );

    console.log("📋 [LOCATION API] Resource creation check", {
      allowed: canCreate.allowed,
      willTriggerOverage: canCreate.willTriggerOverage,
      currentCount: company.location_count,
      limit: canCreate.limit,
      reason: canCreate.reason,
    });

    if (!canCreate.allowed) {
      console.warn(
        "⛔ [LOCATION API] Cannot create location, hard limit reached"
      );
      return NextResponse.json(
        {
          error: canCreate.reason || "Location limit reached",
          limit: canCreate.limit,
          current: company.location_count,
        },
        { status: 403 }
      );
    }

    // =========================================================
    // 3. START BILLING GUARDRAIL (OVERAGE HANDLING)
    // =========================================================

    const currentPlanId = company.current_plan as PlanId;
    const planConfig = PLANS[currentPlanId];

    console.log("🔍 [LOCATION BILLING] Starting billing check", {
      companyId,
      currentPlan: currentPlanId,
      hasConfig: !!planConfig,
    });

    if (planConfig) {
      const locationLimit = planConfig.limits.locations;
      const currentCount = company.location_count || 0;

      console.log("📊 [LOCATION BILLING] Current usage stats", {
        currentCount,
        locationLimit,
        willTriggerOverage: currentCount >= locationLimit,
      });

      if (currentCount >= locationLimit) {
        const newQuantity = currentCount + 1 - locationLimit;
        const usagePriceId = planConfig.stripe.usage.location;

        console.log("⚠️  [LOCATION BILLING] Overage detected!", {
          currentCount,
          limit: locationLimit,
          newQuantity,
          usagePriceId,
        });

        const activeSubs = company.subscriptions.filter((s) => s.is_active);

        console.log("🔎 [LOCATION BILLING] Active subscriptions found", {
          count: activeSubs.length,
          subscriptions: activeSubs.map((s) => ({
            id: s.id,
            type: s.type,
            hasLocationItem: !!s.stripe_item_id_location,
          })),
        });

        let targetItemId: string | undefined;

        // A. Find existing usage item
        for (const sub of activeSubs) {
          if (sub.stripe_item_id_location) {
            targetItemId = sub.stripe_item_id_location;
            console.log(" [LOCATION BILLING] Found existing usage item in DB", {
              subscriptionId: sub.id,
              itemId: targetItemId,
            });
            break;
          }

          // Fallback: Check Stripe
          console.log("🔍 [LOCATION BILLING] Checking Stripe for usage item", {
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
              " [LOCATION BILLING] Found usage item in Stripe, updating DB",
              {
                itemId: item.id,
                quantity: item.quantity,
              }
            );

            await updateSubscription(sub.id, { stripe_item_id_location: item.id });
            break;
          }
        }

        // B. Update or Create Stripe Item
        try {
          if (targetItemId) {
            console.log("🔄 [LOCATION BILLING] Updating existing Stripe item", {
              itemId: targetItemId,
              newQuantity,
            });

            await stripe.subscriptionItems.update(targetItemId, {
              quantity: newQuantity,
              proration_behavior: "always_invoice",
            });

            console.log(
              " [LOCATION BILLING] Successfully updated Stripe item",
              {
                itemId: targetItemId,
                quantity: newQuantity,
              }
            );
          } else {
            console.log(
              " [LOCATION BILLING] No existing item, creating new one"
            );

            const baseSub = activeSubs.find((s) => s.type === "base");
            if (!baseSub) {
              console.error(
                " [LOCATION BILLING] No active base subscription found",
                {
                  activeSubs: activeSubs.map((s) => ({
                    id: s.id,
                    type: s.type,
                  })),
                }
              );
              throw new Error("No active base subscription found");
            }

            console.log("📋 [LOCATION BILLING] Found base subscription", {
              id: baseSub.id,
              stripeSubId: baseSub.stripe_subscription_id,
            });

            const stripeBaseSub = await stripe.subscriptions.retrieve(
              baseSub.stripe_subscription_id
            );

            const isMonthlyBase =
              stripeBaseSub.items.data[0]?.plan?.interval === "month";

            console.log("📅 [LOCATION BILLING] Base subscription details", {
              interval: stripeBaseSub.items.data[0]?.plan?.interval,
              isMonthly: isMonthlyBase,
            });

            if (isMonthlyBase) {
              console.log(
                "[LOCATION BILLING] Creating usage item on monthly base"
              );

              const newItem = await stripe.subscriptionItems.create({
                subscription: baseSub.stripe_subscription_id,
                price: usagePriceId,
                quantity: newQuantity,
                proration_behavior: "always_invoice",
              });

              console.log(" [LOCATION BILLING] Created new usage item", {
                itemId: newItem.id,
                quantity: newItem.quantity,
              });

              await updateSubscription(baseSub.id, { stripe_item_id_location: newItem.id });

              console.log(" [LOCATION BILLING] Updated DB with new item ID");
            } else {
              console.log(
                " [LOCATION BILLING] Creating usage sidecar subscription for annual base"
              );

              const sidecarSub = await stripe.subscriptions.create({
                customer: company.stripe_customer_id,
                items: [{ price: usagePriceId, quantity: newQuantity }],
                metadata: {
                  type: "usage_sidecar",
                  parent_base_id: baseSub.stripe_subscription_id,
                },
              });

              console.log(" [LOCATION BILLING] Created sidecar subscription", {
                subscriptionId: sidecarSub.id,
                quantity: newQuantity,
              });
            }
          }

          console.log(
            " [LOCATION BILLING] Billing complete, proceeding with location creation"
          );
        } catch (stripeError: unknown) {
          const msg =
            stripeError instanceof Error
              ? stripeError.message
              : "Unknown Stripe Error";

          console.error(" [LOCATION BILLING] Stripe error occurred", {
            error: msg,
            errorType:
              stripeError instanceof Error
                ? stripeError.constructor.name
                : typeof stripeError,
            stack: stripeError instanceof Error ? stripeError.stack : undefined,
          });

          return NextResponse.json(
            { error: "Payment failed. Please check your billing details." },
            { status: 402 }
          );
        }
      } else {
        console.log(
          " [LOCATION BILLING] Within limit, no overage charges needed"
        );
      }
    } else {
      console.warn(
        "⚠️  [LOCATION BILLING] No plan config found, skipping billing"
      );
    }
    // =========================================================
    // END BILLING GUARDRAIL
    // =========================================================

    const locationData: CreateLocationData = {
      company_id: companyId,
      name: validatedData.name,
      slug: validatedData.slug,
      description: validatedData.description || null,
      address: validatedData.address || null,
      timezone: validatedData.timezone,
      is_active: validatedData.is_active,
    };

    console.log("📍 [LOCATION API] Creating location in database", {
      name: locationData.name,
      slug: locationData.slug,
    });

    const location = await createLocation(locationData);

    console.log(" [LOCATION API] Location created successfully", {
      locationId: location.id,
      name: location.name,
    });

    console.log("🎉 [LOCATION API] Request completed successfully");

    return NextResponse.json({ location }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown Error";

    console.error(" [LOCATION API] Request failed", {
      error: msg,
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      stack: error instanceof Error ? error.stack : undefined,
    });

    if (msg === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: msg || "Failed to create location" },
      { status: 400 }
    );
  }
}
