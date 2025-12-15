import { NextResponse } from "next/server";
import { getAuthUser } from "@/utils";
import { getCompanyById } from "@/lib/supabase/companies/queries";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await getAuthUser();
    const { id } = await params;

    const company = await getCompanyById(id, user.id);

    return NextResponse.json({ company }, { status: 200 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message === "Company not found") {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to fetch company" },
      { status: 400 }
    );
  }
}
