import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@supabase/supabase-js";
import { getAuthUser } from "@/utils";

/**
 * Admin endpoint to recalculate employee_count for all companies
 * This is useful for fixing data after migrations or bulk operations
 * Requires authentication
 */
export async function POST(request: Request) {
  try {
    // Require authentication
    await getAuthUser();

    // Use service role client to bypass RLS for admin operations
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get all companies
    const { data: companies, error: companiesError } = await supabase
      .from("companies")
      .select("id, name");

    if (companiesError) {
      throw companiesError;
    }

    if (!companies || companies.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No companies found",
        updated: 0,
      });
    }

    const results: Array<{ companyId: string; name: string; count: number }> =
      [];

    // For each company, count active AND pending members (for billing) and update
    for (const company of companies) {
      // Count all active and pending members (regardless of role) for billing purposes
      const { count, error: countError } = await supabase
        .from("company_members")
        .select("*", { count: "exact", head: true })
        .eq("company_id", company.id)
        .in("status", ["active", "pending"]);

      if (countError) {
        console.error(
          `Error counting members for company ${company.id}:`,
          countError
        );
        continue;
      }

      const billableCount = count || 0;

      // Update the company's employee_count directly
      // Note: employee_count includes both active AND pending members for accurate billing
      await supabase
        .from("companies")
        .update({ employee_count: billableCount })
        .eq("id", company.id);

      results.push({
        companyId: company.id,
        name: company.name,
        count: billableCount,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Recalculated employee counts for ${results.length} companies`,
      updated: results.length,
      results,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to recalculate counts";
    console.error("Error recalculating counts:", errorMessage);

    if (errorMessage === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
