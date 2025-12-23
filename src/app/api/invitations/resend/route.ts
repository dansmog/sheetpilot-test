import { NextResponse } from "next/server";
import { getAuthUser } from "@/utils";
import {
  getCompanyMemberById,
  resendInvitation,
} from "@/lib/supabase/company-members/queries";
import { sendInvitationEmail } from "@/lib/supabase/admin/invitations";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    await getAuthUser(); // Ensure auth
    const body = await request.json();
    const { memberId } = body;

    if (!memberId) {
      return NextResponse.json(
        { error: "Member ID is required" },
        { status: 400 }
      );
    }

    // Fetch the member record with company info
    const member = await getCompanyMemberById(memberId);

    if (!member) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      );
    }

    // Check if the member is in pending status
    if (member.status !== "pending") {
      return NextResponse.json(
        { error: "Only pending invitations can be resent" },
        { status: 400 }
      );
    }

    // Generate a new invitation token
    const invitationToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    // Update the member record with new token and expiry
    await resendInvitation(memberId, {
      invitation_token: invitationToken,
      invitation_sent_at: new Date().toISOString(),
      invitation_expires_at: expiresAt.toISOString(),
    });

    // Send the invitation email
    const invitationLink = `${process.env.NEXT_PUBLIC_BASE_URL}/invite/${invitationToken}`;
    const email = member.email || member.user?.email;

    if (!email) {
      return NextResponse.json(
        { error: "No email found for this member" },
        { status: 400 }
      );
    }

    await sendInvitationEmail({
      email,
      redirectTo: invitationLink,
      data: {
        company_id: member.company_id,
        company_name: member.company?.name || "the company",
        role: member.role,
        invitation_token: invitationToken,
      },
    });

    console.log("📬 [RESEND INVITATION] Email sent successfully", {
      to: email,
      invitationLink,
    });

    return NextResponse.json(
      {
        message: "Invitation resent successfully",
        invitation: {
          id: member.id,
          email,
          expires_at: expiresAt.toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown Error";

    console.error("Error resending invitation:", error);

    if (msg === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (msg === "Member not found") {
      return NextResponse.json({ error: msg }, { status: 404 });
    }

    if (msg === "Only pending invitations can be resent") {
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    return NextResponse.json(
      { error: msg || "Failed to resend invitation" },
      { status: 500 }
    );
  }
}
