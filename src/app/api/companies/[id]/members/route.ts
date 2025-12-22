import { NextResponse } from "next/server";
import { getAuthUser } from "@/utils";
import {
  addCompanyMember,
  getCompanyMembers,
  createInvitation,
  AddCompanyMemberData,
} from "@/lib/supabase/company-members/queries";
import { getCompanyWithAllSubscriptions } from "@/lib/supabase/companies/queries";
import { updateSubscription } from "@/lib/supabase/subscriptions/queries";
import { sendInvitationEmail } from "@/lib/supabase/admin/invitations";
import { getUserByEmail } from "@/lib/supabase/users/queries";
import { addCompanyMemberSchema } from "@/utils/validation-schemas/company-member.schema";
import { inviteEmployeeSchema } from "@/utils/validation-schemas/employee-invitation.schema";
import { Stripe } from "stripe";
import { PLANS, PlanId } from "@/config/pricing";
import { hasActivePlan, canCreateResource } from "@/lib/subscription/plans";
import crypto from "crypto";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

interface CompanySubscription {
  id: string;
  is_active: boolean;
  type: string;
  stripe_subscription_id: string;
  stripe_item_id_employee: string | null;
}

interface CompanyWithBilling {
  id: string;
  name: string;
  current_plan: string; // We will cast this to PlanId later
  subscription_status: string | null;
  employee_count: number;
  stripe_customer_id: string;
  subscriptions: CompanySubscription[]; // The joined array
}

// GET Handler
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await getAuthUser();
    const { id: companyId } = await params;
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("activeOnly") == "true";
    const locationId = searchParams.get("locationId");

    let members;
    if (locationId) {
      const { getLocationMembers } = await import("@/lib/supabase/company-members/queries");
      members = await getLocationMembers(locationId, activeOnly);
    } else {
      members = await getCompanyMembers(companyId, activeOnly);
    }

    return NextResponse.json({ members });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to fetch company members" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await getAuthUser(); // Ensure auth
    const { id: companyId } = await params;
    const body = await request.json();

    console.log({ companyId });

    // 1. Detect if this is an invitation flow or direct-add flow
    const isInvitation = "email" in body;

    // Validate Input based on flow type
    let validatedData;
    if (isInvitation) {
      validatedData = inviteEmployeeSchema.parse({
        ...body,
        company_id: companyId,
      });
    } else {
      validatedData = addCompanyMemberSchema.parse({
        ...body,
        company_id: companyId,
      });
    }

    // =========================================================
    // 2. START SUBSCRIPTION CHECK
    // =========================================================

    //  2. Fetch and Explicitly Type the Response
    const company = (await getCompanyWithAllSubscriptions(
      companyId
    )) as unknown as CompanyWithBilling;

    // Check if company has an active plan (NO PLAN = NO ACCESS)
    if (!hasActivePlan(company.current_plan, company.subscription_status)) {
      return NextResponse.json(
        { error: "Active subscription required to add members" },
        { status: 403 }
      );
    }

    // Check if company can create more employees based on plan limits
    const canCreate = canCreateResource(
      "employee",
      company.employee_count,
      company.current_plan,
      company.subscription_status
    );

    if (!canCreate.allowed) {
      return NextResponse.json(
        {
          error: canCreate.reason || "Employee limit reached",
          limit: canCreate.limit,
          current: company.employee_count,
        },
        { status: 403 }
      );
    }

    // =========================================================
    // 3. START BILLING GUARDRAIL (OVERAGE HANDLING)
    // =========================================================

    const currentPlanId = company.current_plan as PlanId;
    const planConfig = PLANS[currentPlanId];

    if (planConfig) {
      const employeeLimit = planConfig.limits.employees;
      const currentCount = company.employee_count || 0;

      if (currentCount >= employeeLimit) {
        const newQuantity = currentCount + 1 - employeeLimit;
        const usagePriceId = planConfig.stripe.usage.employee;

        //  4. No more 'any' needed here
        const activeSubs = company.subscriptions.filter((s) => s.is_active);

        let targetItemId: string | undefined;

        // A. Find existing usage item
        for (const sub of activeSubs) {
          if (sub.stripe_item_id_employee) {
            targetItemId = sub.stripe_item_id_employee;
            break;
          }

          // Fallback: Check Stripe
          const stripeSub = await stripe.subscriptions.retrieve(
            sub.stripe_subscription_id
          );
          const item = stripeSub.items.data.find(
            (i) => i.price.id === usagePriceId
          );

          if (item) {
            targetItemId = item.id;
            await updateSubscription(sub.id, { stripe_item_id_employee: item.id });
            break;
          }
        }

        // B. Update or Create Stripe Item
        try {
          if (targetItemId) {
            await stripe.subscriptionItems.update(targetItemId, {
              quantity: newQuantity,
              proration_behavior: "always_invoice",
            });
          } else {
            const baseSub = activeSubs.find((s) => s.type === "base");
            if (!baseSub) throw new Error("No active base subscription found");

            const stripeBaseSub = await stripe.subscriptions.retrieve(
              baseSub.stripe_subscription_id
            );

            //  5. Safe Optional Chaining for 'interval'
            const isMonthlyBase =
              stripeBaseSub.items.data[0]?.plan?.interval === "month";

            if (isMonthlyBase) {
              const newItem = await stripe.subscriptionItems.create({
                subscription: baseSub.stripe_subscription_id,
                price: usagePriceId,
                quantity: newQuantity,
                proration_behavior: "always_invoice",
              });

              await updateSubscription(baseSub.id, { stripe_item_id_employee: newItem.id });
            } else {
              await stripe.subscriptions.create({
                customer: company.stripe_customer_id,
                items: [{ price: usagePriceId, quantity: newQuantity }],
                metadata: {
                  type: "usage_sidecar",
                  parent_base_id: baseSub.stripe_subscription_id,
                },
              });
            }
          }
        } catch (stripeError: unknown) {
          const msg =
            stripeError instanceof Error
              ? stripeError.message
              : "Unknown Stripe Error";
          console.error("Stripe Charge Failed:", msg);

          return NextResponse.json(
            { error: "Payment failed. Please check your billing details." },
            { status: 402 }
          );
        }
      }
    }
    // =========================================================
    // END BILLING GUARDRAIL
    // =========================================================

    // 4. Handle based on flow type
    if (isInvitation) {
      // INVITATION FLOW
      const invitationData = validatedData as {
        company_id: string;
        email: string;
        role: "owner" | "manager" | "employee";
        primary_location_id?: string | null;
      };

      // Create invitation token
      const invitationToken = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

      console.log("[MEMBER API] Creating invitation", {
        email: invitationData.email,
        role: invitationData.role,
        expiresAt,
      });

      // Check if user already exists with this email
      const existingUser = await getUserByEmail(invitationData.email);

      // Create company_member record with invitation
      const invitation = await createInvitation({
        company_id: companyId,
        user_id: existingUser?.id || null, // null if user doesn't exist yet
        email: invitationData.email,
        role: invitationData.role,
        status: "pending",
        primary_location_id: invitationData.primary_location_id || null,
        invitation_token: invitationToken,
        invitation_type: "email",
        invitation_sent_at: new Date().toISOString(),
        invitation_expires_at: expiresAt.toISOString(),
      });

      console.log(" [MEMBER API] Invitation created successfully", {
        invitationId: invitation.id,
        email: invitationData.email,
      });

      // Send invitation email using Supabase Auth
      try {
        const invitationLink = `${process.env.NEXT_PUBLIC_BASE_URL}/invite/${invitationToken}`;

        await sendInvitationEmail({
          email: invitationData.email,
          redirectTo: invitationLink,
          data: {
            company_id: companyId,
            company_name: company.name || "the company",
            role: invitationData.role,
            invitation_token: invitationToken,
          },
        });

        console.log("📬 [MEMBER API] Invitation email sent successfully", {
          to: invitationData.email,
          invitationLink,
        });
      } catch (emailError) {
        console.error(" [MEMBER API] Email sending error", emailError);
        // Don't fail the whole request if email fails
        console.warn(
          "  [MEMBER API] Invitation created but email failed to send"
        );
      }

      return NextResponse.json(
        {
          invitation: {
            id: invitation.id,
            email: invitationData.email,
            role: invitationData.role,
            status: "pending",
          },
        },
        { status: 201 }
      );
    } else {
      // DIRECT ADD FLOW
      const memberData = validatedData as AddCompanyMemberData;

      const member = await addCompanyMember(memberData);

      return NextResponse.json({ member }, { status: 201 });
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown Error";

    if (msg === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: msg || "Failed to add company member" },
      { status: 400 }
    );
  }
}
