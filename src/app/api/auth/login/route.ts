import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";
import { getUserCompanies } from "@/lib/supabase/companies/queries";
import { loginSchema } from "@/utils/validation-schemas/auth.schema";

export async function POST(request: NextRequest) {
  console.log("=== Login API called ===");
  try {
    const body = await request.json();
    console.log("Request body received:", { email: body.email });

    const validatedData = loginSchema.safeParse(body);

    if (!validatedData.success) {
      console.log("Validation failed:", validatedData.error.issues);
      return NextResponse.json(
        {
          error: "Validation failed",
          message: validatedData.error.issues.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { email, password } = validatedData.data;

    console.log("Attempting sign in with Supabase...");
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError) {
      console.error("Supabase auth error:", authError);
      return NextResponse.json({ error: authError.message }, { status: 401 });
    }
    if (!authData.user) {
      console.error("No user returned from auth");
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      );
    }

    console.log("Auth successful, fetching user companies...");
    const companies = await getUserCompanies(authData.user.id);
    console.log("User companies count:", companies.length);

    let redirectUrl: string;

    if (companies.length === 0) {
      redirectUrl = "/onboarding/company";
    } else if (companies.length === 1) {
      redirectUrl = `/dashboard/${companies[0].company.slug}/locations`;
    } else {
      redirectUrl = "/dashboard/organizations";
    }

    return NextResponse.json({
      success: true,
      user: authData.user,
      companies,
      redirectUrl,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      {
        error: "An unexpected error occurred",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
