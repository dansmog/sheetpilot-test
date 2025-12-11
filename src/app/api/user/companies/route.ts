import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getUserCompanies } from "@/lib/supabase/companies/queries";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const companies = await getUserCompanies(user.id);
    console.log("the companies", companies);
    return NextResponse.json({
      success: true,
      companies,
    });
  } catch (error) {
    console.error("Error fetching user companies:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch companies",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
