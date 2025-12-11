import { NextResponse } from "next/server";
import { getAuthUser } from "@/utils";
import { createCompanySchema } from "@/utils/validation-schemas/company.schema";
import {
  createCompany,
  checkSlugAvailability,
} from "@/lib/supabase/companies/queries";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json(
        { error: "Slug parameter is required" },
        { status: 400 }
      );
    }

    const result = await checkSlugAvailability(slug);
    return NextResponse.json(result, { status: 200 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to check slug availability" },
      { status: 400 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { user } = await getAuthUser();

    const body = await request.json();
    const validatedData = createCompanySchema.parse(body);

    const company = await createCompany(user.id, {
      name: validatedData.name,
      domain: validatedData.subdomain,
      slug: validatedData.subdomain,
      company_email: validatedData.companyEmail || null,
    });

    return NextResponse.json({ company }, { status: 201 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log({ error });
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || "Failed to create company" },
      { status: 400 }
    );
  }
}
