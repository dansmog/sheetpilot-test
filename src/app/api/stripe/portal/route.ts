import { NextResponse } from "next/server";
import { getAuthUser } from "@/utils";
import { Stripe } from "stripe";
import { getCompanyById } from "@/lib/supabase/companies/queries";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

export async function POST(req: Request) {
  try {
    const { user } = await getAuthUser();

    const { companyId, returnUrl } = await req.json();

    const company = await getCompanyById(companyId, user.id);

    if (!company?.stripe_customer_id) {
      return new NextResponse("No billing account found", { status: 404 });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: company.stripe_customer_id,
      return_url: returnUrl || `${process.env.NEXT_PUBLIC_URL}/dashboard`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[STRIPE_PORTAL]", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    if (msg === "Unauthorized") {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
}
