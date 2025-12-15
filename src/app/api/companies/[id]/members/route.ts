import { NextResponse } from "next/server";
import { getAuthUser } from "@/utils";
import {
  getCompanyMembers,
  addCompanyMember,
  AddCompanyMemberData,
} from "@/lib/supabase/company-members/queries";
import { addCompanyMemberSchema } from "@/utils/validation-schemas/company-member.schema";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await getAuthUser();
    const { id: companyId } = await params;
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("activeOnly") === "true";

    const members = await getCompanyMembers(companyId, activeOnly);

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
    const { id: companyId } = await params;
    const body = await request.json();

    // Validate the body (excluding company_id since it comes from URL)
    const validatedData = addCompanyMemberSchema.parse({
      ...body,
      company_id: companyId, // Override with URL param
    });

    const memberData: AddCompanyMemberData = {
      company_id: companyId,
      user_id: validatedData.user_id,
      role: validatedData.role,
      status: validatedData.status,
    };

    const member = await addCompanyMember(memberData);

    return NextResponse.json({ member }, { status: 201 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || "Failed to add company member" },
      { status: 400 }
    );
  }
}
