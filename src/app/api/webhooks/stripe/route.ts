import { Stripe } from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { PLANS, PlanId } from "@/config/pricing";
import {
  upsertSubscriptionAdmin,
  updateSubscriptionByStripeIdAdmin,
} from "@/lib/supabase/admin/subscriptions";
import {
  updateCompanyAdmin,
  updateCompanyByStripeCustomerIdAdmin,
  getCompanyByStripeCustomerIdAdmin,
} from "@/lib/supabase/admin/companies";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

// Helper to find Plan ID from a Stripe Price ID
function getPlanFromPriceId(priceId: string): PlanId | null {
  for (const [key, plan] of Object.entries(PLANS)) {
    if (plan.stripe.monthly === priceId || plan.stripe.yearly === priceId) {
      return key as PlanId;
    }
  }
  return null;
}

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(`Webhook signature verification failed: ${errorMessage}`);
    return new NextResponse(`Webhook Error: ${errorMessage}`, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const subscription = event.data.object as Stripe.Subscription;

  // =====================================================
  // 1. CHECKOUT COMPLETED (New Subscription)
  // =====================================================
  if (event.type === "checkout.session.completed") {
    const { companyId, planId } = session.metadata || {};

    if (!companyId || !planId) {
      console.error("Missing metadata in checkout session", {
        sessionId: session.id,
        metadata: session.metadata,
      });
      return new NextResponse(null, { status: 200 });
    }

    const subId = session.subscription as string;

    try {
      // Fetch full subscription details from Stripe to get dates
      const stripeSub = await stripe.subscriptions.retrieve(subId, {
        expand: ["items.data"],
      });
      const firstItem = stripeSub.items.data[0];
      const billingInterval = firstItem.price.recurring?.interval; // 'month' or 'year'

      // A. Create/Update Subscription Record (idempotent for webhook retries)
      await upsertSubscriptionAdmin({
        company_id: companyId,
        stripe_subscription_id: subId,
        stripe_price_id: firstItem.price.id,
        status: stripeSub.status,
        plan_name: planId,
        type: "base", // It's always a base plan coming from checkout
        is_active: true,
        billing_interval: billingInterval, // Store the billing interval
        current_period_start: new Date(
          firstItem.current_period_start * 1000
        ).toISOString(),
        current_period_end: new Date(
          firstItem.current_period_end * 1000
        ).toISOString(),
        updated_at: new Date().toISOString(),
      });

      // B. Update Company Profile (also idempotent)
      await updateCompanyAdmin(companyId, {
        current_plan: planId,
        stripe_customer_id: session.customer as string,
        subscription_status: "active",
      });
    } catch (error) {
      console.error("Error processing checkout.session.completed:", {
        error,
        sessionId: session.id,
        subscriptionId: subId,
      });
      return new NextResponse(
        `Error processing checkout: ${error instanceof Error ? error.message : "Unknown error"
        }`,
        { status: 500 }
      );
    }
  }

  if (event.type === "customer.subscription.updated") {
    try {
      const firstItem = subscription.items.data[0];
      const priceId = firstItem.price.id;
      const planId = getPlanFromPriceId(priceId);

      // Sync status and dates (idempotent update)
      await updateSubscriptionByStripeIdAdmin(subscription.id, {
        status: subscription.status,
        is_active:
          subscription.status === "active" ||
          subscription.status === "trialing",
        current_period_start: new Date(
          firstItem.current_period_start * 1000
        ).toISOString(),
        current_period_end: new Date(
          firstItem.current_period_end * 1000
        ).toISOString(),
        plan_name: planId || undefined, // Update plan name if we found it
        cancel_at_period_end: subscription.cancel_at_period_end,
        updated_at: new Date().toISOString(),
      });

      // HANDLE PLAN CHANGE (User upgraded/downgraded)
      if (planId) {
        // Fetch company to check for scheduled changes
        const company = await getCompanyByStripeCustomerIdAdmin(
          subscription.customer as string
        );

        // Check if this update is a scheduled downgrade taking effect
        const isScheduledDowngrade =
          company?.scheduled_plan_change === planId &&
          company?.scheduled_change_date &&
          new Date(company.scheduled_change_date) <= new Date();

        if (isScheduledDowngrade) {
          // Clear scheduled change and update current plan
          await updateCompanyByStripeCustomerIdAdmin(
            subscription.customer as string,
            {
              current_plan: planId,
              scheduled_plan_change: null,
              scheduled_change_date: null,
            }
          );
        } else {
          // Immediate upgrade (or portal change)
          await updateCompanyByStripeCustomerIdAdmin(
            subscription.customer as string,
            { current_plan: planId }
          );
        }
      }
    } catch (error) {
      console.error("Error processing customer.subscription.updated:", {
        error,
        subscriptionId: subscription.id,
      });
      return new NextResponse(
        `Error processing subscription update: ${error instanceof Error ? error.message : "Unknown error"
        }`,
        { status: 500 }
      );
    }
  }

  if (event.type === "customer.subscription.deleted") {
    try {
      // 1. Mark subscription as inactive (idempotent update)
      await updateSubscriptionByStripeIdAdmin(subscription.id, {
        status: subscription.status,
        is_active: false,
        // ended_at: new Date().toISOString(), // Subscription interface doesn't have ended_at? Let's check.
        updated_at: new Date().toISOString(),
      });

      // 2. Check if this was a Base Plan or Sidecar
      // If Base Plan is deleted, we should probably clean up sidecars too.
      // (Optional: our invite logic is robust enough to handle this, but explicit cleanup is nice)

      // 3. Update Company Status
      await updateCompanyByStripeCustomerIdAdmin(
        subscription.customer as string,
        { subscription_status: "canceled" }
      );
    } catch (error) {
      console.error("Error processing customer.subscription.deleted:", {
        error,
        subscriptionId: subscription.id,
      });
      return new NextResponse(
        `Error processing subscription deletion: ${error instanceof Error ? error.message : "Unknown error"
        }`,
        { status: 500 }
      );
    }
  }

  return new NextResponse(null, { status: 200 });
}
