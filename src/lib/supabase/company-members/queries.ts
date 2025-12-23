import { createClient } from "@/utils/supabase/server";
import { CompanyMemberProps } from "@/utils/types";
import { updateCompany } from "@/lib/supabase/companies/queries";

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
  role: "owner" | "admin" | "member" | "manager" | "employee";
  status?: "active" | "inactive" | "pending";
}

export async function getCompanyMembers(
  companyId: string,
  activeOnly: boolean = false
): Promise<CompanyMemberProps[]> {
  const supabase = await createClient();

  let query = supabase
    .from("company_members")
    .select(
      `
      *,
      user:users!company_members_user_id_fkey (
        id,
        full_name,
        email,
        avatar_url
      ),
      primary_location:locations!company_members_primary_location_id_fkey (
        id,
        name,
        slug
      )
    `
    )
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (activeOnly) {
    query = query.eq("status", "active");
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

export async function getLocationMembers(
  locationId: string,
  activeOnly: boolean = false
): Promise<CompanyMemberProps[]> {
  const supabase = await createClient();

  let query = supabase
    .from("company_members")
    .select(
      `
      *,
      user:users!company_members_user_id_fkey (
        id,
        full_name,
        email,
        avatar_url
      ),
      primary_location:locations!company_members_primary_location_id_fkey (
        id,
        name,
        slug
      )
    `
    )
    .eq("primary_location_id", locationId)
    .order("created_at", { ascending: false });

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

  // Increment employee_count if the member is active or pending (for billing purposes)
  const countableStatuses = ["active", "pending"];
  const memberStatus = memberData.status || "active";

  if (countableStatuses.includes(memberStatus)) {
    const { data: company } = await supabase
      .from("companies")
      .select("employee_count")
      .eq("id", memberData.company_id)
      .single();

    if (company) {
      await updateCompany(memberData.company_id, {
        employee_count: (company.employee_count || 0) + 1,
      });
    }
  }

  return data;
}

export interface CreateInvitationData {
  company_id: string;
  user_id?: string | null;
  email: string;
  role: "owner" | "admin" | "member" | "manager" | "employee";
  status: "pending";
  primary_location_id?: string | null;
  invitation_token: string;
  invitation_type: "email";
  invitation_sent_at: string;
  invitation_expires_at: string;
}

export async function createInvitation(
  invitationData: CreateInvitationData
): Promise<CompanyMember> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("company_members")
    .insert(invitationData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export interface UpdateCompanyMemberData {
  status?: "active" | "pending" | "suspended" | "fired" | "left" | "rejected";
  role?: "owner" | "admin" | "member" | "manager" | "employee";
  user_id?: string | null;
  primary_location_id?: string | null;
  suspended_at?: string | null;
  suspended_by?: string | null;
  suspended_reason?: string | null;
  fired_at?: string | null;
  fired_by?: string | null;
  fired_reason?: string | null;
  left_at?: string | null;
  left_reason?: string | null;
  rejected_at?: string | null;
  rejected_by?: string | null;
  rejected_reason?: string | null;
  invitation_accepted_at?: string | null;
}

export async function updateCompanyMember(
  memberId: string,
  companyId: string,
  updates: UpdateCompanyMemberData
): Promise<CompanyMember> {
  const supabase = await createClient();

  // Get the current member status before updating
  const { data: oldMember } = await supabase
    .from("company_members")
    .select("status")
    .eq("id", memberId)
    .eq("company_id", companyId)
    .single();

  const { data, error } = await supabase
    .from("company_members")
    .update(updates)
    .eq("id", memberId)
    .eq("company_id", companyId)
    .select()
    .single();

  if (error) throw error;

  // Handle employee_count updates when status changes
  if (updates.status && oldMember && oldMember.status !== updates.status) {
    const { data: company } = await supabase
      .from("companies")
      .select("employee_count")
      .eq("id", companyId)
      .single();

    if (company) {
      let newCount = company.employee_count || 0;

      // Statuses that count toward billing (active and pending)
      const countableStatuses = ["active", "pending"];
      const oldCounts = countableStatuses.includes(oldMember.status);
      const newCounts = countableStatuses.includes(updates.status);

      // If changing from non-countable to countable status, increment
      if (!oldCounts && newCounts) {
        newCount += 1;
      }
      // If changing from countable to non-countable status, decrement
      else if (oldCounts && !newCounts) {
        newCount = Math.max(0, newCount - 1);
      }

      // Only update if count changed
      if (newCount !== company.employee_count) {
        await updateCompany(companyId, { employee_count: newCount });
      }
    }
  }

  return data;
}

export async function deleteCompanyMember(
  memberId: string,
  companyId: string
): Promise<void> {
  const supabase = await createClient();

  // Get the member's status before deleting to know if we need to decrement count
  const { data: member } = await supabase
    .from("company_members")
    .select("status")
    .eq("id", memberId)
    .eq("company_id", companyId)
    .single();

  const { error } = await supabase
    .from("company_members")
    .delete()
    .eq("id", memberId)
    .eq("company_id", companyId);

  if (error) throw error;

  // Decrement employee_count if the deleted member was countable (active or pending)
  const countableStatuses = ["active", "pending"];
  if (member && countableStatuses.includes(member.status)) {
    const { data: company } = await supabase
      .from("companies")
      .select("employee_count")
      .eq("id", companyId)
      .single();

    if (company) {
      await updateCompany(companyId, {
        employee_count: Math.max(0, (company.employee_count || 0) - 1),
      });
    }
  }
}

export async function getCompanyMemberById(
  memberId: string
): Promise<CompanyMemberProps> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("company_members")
    .select(
      `
      *,
      user:users!company_members_user_id_fkey (
        id,
        full_name,
        email,
        avatar_url
      ),
      company:companies!company_members_company_id_fkey (
        id,
        name
      ),
      primary_location:locations!company_members_primary_location_id_fkey (
        id,
        name,
        slug
      )
    `
    )
    .eq("id", memberId)
    .single();

  if (error) throw error;
  return data;
}

export interface ResendInvitationData {
  invitation_token: string;
  invitation_sent_at: string;
  invitation_expires_at: string;
}

export async function resendInvitation(
  memberId: string,
  invitationData: ResendInvitationData
): Promise<CompanyMember> {
  const supabase = await createClient();

  // First check if the member exists and is pending
  const { data: existingMember, error: checkError } = await supabase
    .from("company_members")
    .select("id, status")
    .eq("id", memberId)
    .single();

  if (checkError || !existingMember) {
    throw new Error("Member not found");
  }

  if (existingMember.status !== "pending") {
    throw new Error("Only pending invitations can be resent");
  }

  // Update the invitation details
  const { data, error } = await supabase
    .from("company_members")
    .update(invitationData)
    .eq("id", memberId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
