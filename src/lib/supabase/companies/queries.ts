import { createClient } from "@/utils/supabase/server";
import { CompanyProps } from "@/utils/types";
import { addCompanyMember } from "@/lib/supabase/company-members/queries";

export async function getCompany(
  companyId: string
): Promise<CompanyProps | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("companies")
    .select(`
      *,
      subscriptions!subscriptions_company_id_fkey (
        id,
        stripe_subscription_id,
        status,
        current_period_start,
        current_period_end,
        cancel_at_period_end,
        is_active
      )
    `)
    .eq("id", companyId)
    .eq("is_active", true)
    .eq("subscriptions.is_active", true)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getCompanyById(
  companyId: string,
  userId: string
): Promise<CompanyProps> {
  const supabase = await createClient();

  // First, verify user is a member of this company
  const { data: membership, error: membershipError } = await supabase
    .from("company_members")
    .select("id")
    .eq("company_id", companyId)
    .eq("user_id", userId)
    .eq("status", "active")
    .single();

  if (membershipError || !membership) {
    throw new Error("Unauthorized");
  }

  // Fetch company details with subscription info
  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select(`
      *,
      subscriptions!subscriptions_company_id_fkey (
        id,
        stripe_subscription_id,
        status,
        current_period_start,
        current_period_end,
        cancel_at_period_end,
        is_active
      )
    `)
    .eq("id", companyId)
    .eq("is_active", true)
    .eq("subscriptions.is_active", true)
    .single();

  if (companyError) {
    throw companyError;
  }

  if (!company) {
    throw new Error("Company not found");
  }

  return company;
}

export interface CreateCompanyData {
  name: string;
  domain: string;
  slug: string;
  company_email?: string | null;
}

export async function createCompany(
  userId: string,
  companyData: CreateCompanyData
): Promise<CompanyProps> {
  const supabase = await createClient();
  const { data: company, error: companyError } = await supabase
    .from("companies")
    .insert(companyData)
    .select()
    .single();

  if (companyError) throw companyError;

  try {
    // Make user the owner
    await addCompanyMember({
      company_id: company.id,
      user_id: userId,
      role: "owner",
      status: "active",
    });
  } catch (memberError) {
    // Cleanup on failure
    await supabase.from("companies").delete().eq("id", company.id);
    throw memberError;
  }

  return company;
}

export async function checkSlugAvailability(
  slug: string
): Promise<{ available: boolean }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("companies")
    .select("slug")
    .or(`slug.eq.${slug},domain.eq.${slug}`)
    .limit(1);

  if (error) throw error;

  return { available: !data || data.length === 0 };
}

export interface UserCompany {
  id: string;
  company_id: string;
  role: string;
  status: string;
  company: {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
    current_plan: string | null;
    subscription_status: string | null;
    location_count: number;
    employee_count: number;
    scheduled_plan_change?: string | null;
    scheduled_change_date?: string | null;
    subscriptions?: Array<{
      id: string;
      stripe_subscription_id: string | null;
      status: string | null;
      current_period_start: string | null;
      current_period_end: string | null;
      cancel_at_period_end: boolean | null;
      is_active: boolean | null;
      billing_interval?: string | null;
    }>;
  };
}

export async function getUserCompanies(userId: string): Promise<UserCompany[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("company_members")
    .select(
      `
      id,
      company_id,
      role,
      status,
      companies!inner (
        id,
        name,
        slug,
        logo_url,
        current_plan,
        subscription_status,
        location_count,
        employee_count,
        scheduled_plan_change,
        scheduled_change_date,
        subscriptions!subscriptions_company_id_fkey (
          id,
          stripe_subscription_id,
          status,
          current_period_start,
          current_period_end,
          cancel_at_period_end,
          is_active,
          billing_interval
        )
      )
    `
    )
    .eq("user_id", userId)
    .eq("status", "active")
    .eq("companies.subscriptions.is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching user companies:", error);
    throw error;
  }

  console.log("company data", { data });

  // Transform the data to match UserCompany interface
  if (!data) return [];

  // Process each company and verify/correct employee count
  const results = await Promise.all(
    data.map(async (item) => {
      const company = Array.isArray(item.companies)
        ? item.companies[0]
        : item.companies;

      // Count actual billable members (active + pending)
      const { count: actualCount } = await supabase
        .from("company_members")
        .select("*", { count: "exact", head: true })
        .eq("company_id", company.id)
        .in("status", ["active", "pending"]);

      const actualEmployeeCount = actualCount || 0;
      const storedEmployeeCount = company.employee_count || 0;

      // If actual count is higher than stored count, update the database
      if (actualEmployeeCount > storedEmployeeCount) {
        console.log(
          `Correcting employee count for company ${company.id}: ${storedEmployeeCount} -> ${actualEmployeeCount}`
        );
        await updateCompany(company.id, {
          employee_count: actualEmployeeCount,
        });
      }

      return {
        id: item.id,
        company_id: item.company_id,
        role: item.role,
        status: item.status,
        company: {
          id: company.id,
          name: company.name,
          slug: company.slug,
          logo_url: company.logo_url,
          current_plan: company.current_plan,
          subscription_status: company.subscription_status,
          location_count: company.location_count || 0,
          employee_count: Math.max(actualEmployeeCount, storedEmployeeCount),
          scheduled_plan_change: company.scheduled_plan_change,
          scheduled_change_date: company.scheduled_change_date,
          subscriptions: company.subscriptions || [],
        },
      };
    })
  );

  return results as UserCompany[];
}

export async function getUserPrimaryCompany(userId: string) {
  const companies = await getUserCompanies(userId);
  const ownerCompany = companies.find((c) => c.role === "owner");
  return ownerCompany || companies[0] || null;
}

export async function updateCompany(
  companyId: string,
  updates: Partial<CompanyProps>
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("companies")
    .update(updates)
    .eq("id", companyId);

  if (error) {
    throw error;
  }
}

export async function getCompanyWithAllSubscriptions(
  companyId: string
): Promise<CompanyProps> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("companies")
    .select("*, subscriptions(*)")
    .eq("id", companyId)
    .single();

  if (error) throw error;
  if (!data) throw new Error("Company not found");

  return data;
}

export async function getCompanyByStripeCustomerId(
  stripeCustomerId: string
): Promise<CompanyProps | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("stripe_customer_id", stripeCustomerId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // Not found
    throw error;
  }

  return data;
}

export async function updateCompanyByStripeCustomerId(
  stripeCustomerId: string,
  updates: Partial<CompanyProps>
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("companies")
    .update(updates)
    .eq("stripe_customer_id", stripeCustomerId);

  if (error) throw error;
}
