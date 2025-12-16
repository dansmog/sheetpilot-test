import { createClient } from "@/utils/supabase/server";
import { CompanyProps } from "@/utils/types";
import { addCompanyMember } from "@/lib/supabase/company-members/queries";

export async function getCompany(
  companyId: string
): Promise<CompanyProps | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("id", companyId)
    .eq("is_active", true)
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

  // Fetch company details
  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("*")
    .eq("id", companyId)
    .eq("is_active", true)
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
    location_count: number;
    employee_count: number;
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
        location_count,
        employee_count
      )
    `
    )
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching user companies:", error);
    throw error;
  }

  console.log("company data", { data });

  // Transform the data to match UserCompany interface
  if (!data) return [];

  return data.map((item) => {
    const company = Array.isArray(item.companies)
      ? item.companies[0]
      : item.companies;
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
        location_count: company.location_count || 0,
        employee_count: company.employee_count || 0,
      },
    };
  }) as UserCompany[];
}

export async function getUserPrimaryCompany(userId: string) {
  const companies = await getUserCompanies(userId);
  const ownerCompany = companies.find((c) => c.role === "owner");
  return ownerCompany || companies[0] || null;
}

export async function updateCompany(
  companyId: string,
  updates: Partial<{
    name: string;
    slug: string;
    domain: string;
    logo_url: string | null;
    company_email: string | null;
    current_plan: string | null;
    location_count: number;
    employee_count: number;
  }>
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
