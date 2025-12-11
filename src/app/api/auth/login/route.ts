import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";
import { getUserPrimaryCompany } from "@/lib/supabase/companies/queries";
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

    console.log("Auth successful, fetching primary company...");
    const primaryCompany = await getUserPrimaryCompany(authData.user.id);
    console.log("Primary company:", primaryCompany?.company?.slug || "none");

    const redirectUrl = primaryCompany
      ? `/dashboard/${primaryCompany.company.slug}`
      : "/onboarding/company";

    console.log("Login successful, redirecting to:", redirectUrl);
    return NextResponse.json({
      success: true,
      user: authData.user,
      company: primaryCompany,
      redirectUrl,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
