import { createClient } from "@/utils/supabase/server";

export interface CompanyMember {
  id: string;
  company_id: string;
  user_id: string;
  role: "owner" | "admin" | "member";
  status: "active" | "inactive" | "pending";
  created_at: string;
  updated_at: string;
}

export interface AddCompanyMemberData {
  company_id: string;
  user_id: string;
  role: "owner" | "admin" | "member";
  status?: "active" | "inactive" | "pending";
}

export async function getCompanyMembers(
  companyId: string,
  activeOnly: boolean = false
): Promise<CompanyMember[]> {
  const supabase = await createClient();

  let query = supabase
    .from("company_members")
    .select("*")
    .eq("company_id", companyId);

  if (activeOnly) {
    query = query.eq("status", "active");
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

export async function addCompanyMember(
  memberData: AddCompanyMemberData
): Promise<CompanyMember> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("company_members")
    .insert(memberData)
    .select()
    .single();

  if (error) throw error;
  return data;
}
