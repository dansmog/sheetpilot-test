import { NextResponse } from "next/server";
import { getAuthUser } from "@/utils";
import { Stripe } from "stripe";
import { PLANS, PlanId } from "@/config/pricing";
import { getCompanyWithAllSubscriptions } from "@/lib/supabase/companies/queries";
import {
  deleteCompanyMember,
  updateCompanyMember,
  UpdateCompanyMemberData
} from "@/lib/supabase/company-members/queries";
import { updateSubscription } from "@/lib/supabase/subscriptions/queries";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

interface CompanyWithBilling {
  id: string;
  name: string;
  current_plan: string;
  subscription_status: string | null;
  employee_count: number;
  stripe_customer_id: string;
  subscriptions: Array<{
    id: string;
    is_active: boolean;
    type: string;
    stripe_subscription_id: string;
    stripe_item_id_employee: string | null;
  }>;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    await getAuthUser(); // Check auth
    const { id: companyId, memberId } = await params;
    const body = await request.json();

    const updates: UpdateCompanyMemberData = body;

    const updatedMember = await updateCompanyMember(memberId, companyId, updates);

    return NextResponse.json({ member: updatedMember });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to update member";
    if (errorMessage === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    await getAuthUser(); // Check auth
    const { id: companyId, memberId } = await params;

    // 1. Fetch Company Status BEFORE deletion (to know current count)
    const company = (await getCompanyWithAllSubscriptions(
      companyId
    )) as unknown as CompanyWithBilling;

    const currentPlanId = company.current_plan as PlanId;
    const planConfig = PLANS[currentPlanId];

    // 2. Delete Member from DB
    // We do this first to ensure the app state is correct even if Stripe fails slightly
    await deleteCompanyMember(memberId, companyId);

    // 3. Handle Billing Downgrade
    if (planConfig) {
      const employeeLimit = planConfig.limits.employees;
      const oldCount = company.employee_count; // This is count BEFORE delete
      const newCount = Math.max(0, oldCount - 1); // Ensure non-negative
      const newQuantity = Math.max(0, newCount - employeeLimit);

      // We only need to act if we were previously above the limit
      // i.e., oldCount > employeeLimit
      if (oldCount > employeeLimit) {
        const activeSubs = company.subscriptions.filter((s) => s.is_active);
        let targetItemId: string | undefined;
        let targetSubId: string | undefined;

        // Find the item to reduce
        for (const sub of activeSubs) {
          if (sub.stripe_item_id_employee) {
            targetItemId = sub.stripe_item_id_employee;
            targetSubId = sub.id;
            break;
          }
        }

        if (targetItemId && targetSubId) {
          if (newQuantity === 0) {
            // Remove the item entirely if we are back to base limit
            try {
              await stripe.subscriptionItems.del(targetItemId);
              await updateSubscription(targetSubId, {
                stripe_item_id_employee: null,
              });
            } catch (e) {
              console.error("Stripe delete item failed", e);
            }
          } else {
            // Update quantity
            try {
              await stripe.subscriptionItems.update(targetItemId, {
                quantity: newQuantity,
                proration_behavior: "always_invoice", // Issues credit immediately
              });
            } catch (e) {
              console.error("Stripe update failed", e);
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to remove member";
    if (errorMessage === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
