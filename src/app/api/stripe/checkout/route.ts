import { NextResponse } from "next/server";
import { getAuthUser } from "@/utils";
import { Stripe } from "stripe";
import { PLANS, PlanId } from "@/config/pricing";
import {
  getCompanyById,
  updateCompany,
} from "@/lib/supabase/companies/queries";
import {
  getActiveSubscription,
  updateSubscription,
} from "@/lib/supabase/subscriptions/queries";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

export async function POST(req: Request) {
  try {
    const { user } = await getAuthUser();

    const { planId, interval, companyId } = await req.json();

    if (!companyId) {
      return NextResponse.json(
        { error: "Company ID is required" },
        { status: 400 }
      );
    }

    const plan = PLANS[planId as PlanId];

    console.log({ plan });

    if (!plan) {
      return NextResponse.json({ error: "Invalid Plan" }, { status: 400 });
    }

    // Fetch company (verifies membership)
    const company = await getCompanyById(companyId, user.id);

    // Check for existing active subscription
    const activeSub = await getActiveSubscription(companyId);

    // If user has an active subscription, handle plan switching
    if (activeSub) {
      const PLAN_RANK: Record<PlanId, number> = {
        lite: 1,
        starter: 2,
        growth: 3,
        scale: 4,
      };
      const isSamePlan = activeSub.plan_name === planId;
      const isUpgrade =
        PLAN_RANK[planId as PlanId] > PLAN_RANK[activeSub.plan_name as PlanId];
      const isBillingCycleSwitch = activeSub.billing_interval !== interval;

      // CASE 1: Billing cycle switch (monthly↔annual on same plan)
      if (isSamePlan && isBillingCycleSwitch) {
        // Cancel current subscription immediately
        await stripe.subscriptions.cancel(activeSub.stripe_subscription_id!);

        // Mark old subscription as inactive
        await updateSubscription(activeSub.id, {
          is_active: false,
          status: "canceled",
        });

        // Continue to create new checkout session below
      }
      // CASE 2: Plan change (upgrade or downgrade to different plan)
      else if (!isSamePlan) {
        const newPriceId =
          interval === "monthly" ? plan.stripe.monthly : plan.stripe.yearly;

        // Fetch current Stripe subscription to get item ID
        const stripeSub = (await stripe.subscriptions.retrieve(
          activeSub.stripe_subscription_id!
        )) as Stripe.Subscription;

        if (isUpgrade) {
          // Update subscription immediately for upgrades
          try {
            await stripe.subscriptions.update(
              activeSub.stripe_subscription_id!,
              {
                items: [
                  {
                    id: stripeSub.items.data[0].id,
                    price: newPriceId,
                  },
                ],
                proration_behavior: "always_invoice",
                payment_behavior: "error_if_incomplete",
              }
            );
          } catch (error) {
            // Handle specific Stripe card errors
            if (
              error &&
              typeof error === "object" &&
              "type" in error &&
              error.type === "StripeCardError"
            ) {
              return NextResponse.json(
                {
                  error:
                    (error as { message?: string }).message ||
                    "Your card was declined. Please check your payment method.",
                },
                { status: 402 }
              );
            }
            throw error;
          }
        } else {
          // For downgrades, schedule the change at the end of the period
          // 1. Create a schedule from the existing subscription
          const schedule = await stripe.subscriptionSchedules.create({
            from_subscription: activeSub.stripe_subscription_id!,
          });

          // 2. Update the schedule to switch plans at the end of the current phase
          await stripe.subscriptionSchedules.update(schedule.id, {
            end_behavior: "release",
            phases: [
              {
                start_date: schedule.phases[0].start_date,
                end_date: schedule.phases[0].end_date,
                items: schedule.phases[0].items.map((item) => ({
                  price: item.price as string,
                  quantity: item.quantity,
                })), // Keep current items for this phase
              },
              {
                start_date: schedule.phases[0].end_date, // Start new phase when current ends
                items: [{ price: newPriceId, quantity: 1 }],
              },
            ],
          });

          // Update DB to reflect scheduled change
          await updateCompany(companyId, {
            scheduled_plan_change: planId,
            scheduled_change_date: new Date(
              schedule.phases[0].end_date * 1000
            ).toISOString(),
          });
        }

        return NextResponse.json({
          success: true,
          message: isUpgrade
            ? "Plan upgraded successfully!"
            : "Downgrade scheduled for end of billing period",
        });
      }
      // CASE 3: Same plan, same interval (shouldn't happen, but handle it)
      else {
        return NextResponse.json(
          {
            success: false,
            message: "You're already on this plan",
          },
          { status: 400 }
        );
      }
    }

    // NEW SUBSCRIPTION PATH (for first-time subscribers AND billing cycle switches)
    let customerId = company.stripe_customer_id; // getCompanyById returns CompanyProps which has this
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: company.company_email || user.email,
        name: company.name,
        metadata: { companyId, supabaseUserId: user.id },
      });
      customerId = customer.id;
      await updateCompany(companyId, { stripe_customer_id: customerId });
    }

    // 3. Define Line Items (Base Plan)
    const priceId =
      interval === "monthly" ? plan.stripe.monthly : plan.stripe.yearly;
    const line_items = [{ price: priceId, quantity: 1 }];

    // Get base URL from environment or request headers
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      `${req.headers.get("x-forwarded-proto") || "http"}://${req.headers.get(
        "host"
      )}`;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items,
      metadata: {
        companyId,
        planId,
        interval,
        // Flags for Webhook Logic
        is_annual: interval === "annually" ? "true" : "false",
      },
      success_url: `${baseUrl}/checkout/success`,
      cancel_url: `${baseUrl}/upgrade`,
      allow_promotion_codes: true,
      tax_id_collection: { enabled: true },
      customer_update: {
        name: "auto",
        address: "auto",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[STRIPE_CHECKOUT]", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    if (errorMessage === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Internal Error", details: errorMessage },
      { status: 500 }
    );
  }
}
