import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { updateCompanyMember } from "@/lib/supabase/company-members/queries";

export async function POST(request: Request) {
  try {
    const { token, userId } = await request.json();

    if (!token || !userId) {
      return NextResponse.json(
        { error: "Token and userId are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Find the invitation
    const { data: invitation, error: invitationError } = await supabase
      .from("company_members")
      .select("id, company_id, status, invitation_expires_at")
      .eq("invitation_token", token)
      .eq("status", "pending")
      .single();

    if (invitationError || !invitation) {
      return NextResponse.json(
        { error: "Invalid or expired invitation" },
        { status: 404 }
      );
    }

    // Check if invitation has expired
    if (
      invitation.invitation_expires_at &&
      new Date(invitation.invitation_expires_at) < new Date()
    ) {
      return NextResponse.json(
        { error: "Invitation has expired" },
        { status: 400 }
      );
    }

    // Update the member status to active using our function that handles employee_count
    await updateCompanyMember(invitation.id, invitation.company_id, {
      status: "active",
      user_id: userId,
      invitation_accepted_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      companyId: invitation.company_id,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to accept invitation";
    console.error("Error accepting invitation:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
