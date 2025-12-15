import { NextResponse } from "next/server";
import { getAuthUser } from "@/utils";
import { createCompanySchema } from "@/utils/validation-schemas/company.schema";
import {
  createCompany,
  checkSlugAvailability,
  getUserCompanies,
} from "@/lib/supabase/companies/queries";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const userId = searchParams.get("userId");

    // Check slug availability
    if (slug) {
      const result = await checkSlugAvailability(slug);
      return NextResponse.json(result, { status: 200 });
    }

    // Get user companies
    if (userId) {
      const { user } = await getAuthUser();

      // Verify the requesting user matches the userId parameter
      if (user.id !== userId) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }

      const companies = await getUserCompanies(userId);
      return NextResponse.json({
        success: true,
        companies,
      });
    }

    return NextResponse.json(
      { error: "Either slug or userId parameter is required" },
      { status: 400 }
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || "Failed to process request" },
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
