import { NextResponse } from "next/server";
import { getAuthUser } from "@/utils";
import { createCompanySchema } from "@/utils/validation-schemas/company.schema";

export async function POST(request: Request) {
  try {
    const { user, supabase } = await getAuthUser();

    const body = await request.json();
    const validatedData = createCompanySchema.parse(body);

    const { data: company, error: companyError } = await supabase
      .from("companies")
      .insert({
        name: validatedData.name,
        domain: validatedData.subdomain,
        console_slug: validatedData.subdomain,
        company_email: validatedData.companyEmail || null,
      })
      .select()
      .single();

    if (companyError) throw companyError;

    // Make user the owner
    const { error: memberError } = await supabase
      .from("company_members")
      .insert({
        company_id: company.id,
        user_id: user.id,
        role: "owner",
        status: "active",
      });

    if (memberError) {
      // Cleanup on failure
      await supabase.from("companies").delete().eq("id", company.id);
      throw memberError;
    }

    return NextResponse.json({ company }, { status: 201 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || "Failed to create company" },
      { status: 400 }
    );
  }
}
