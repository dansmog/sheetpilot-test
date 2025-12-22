"use client";

import { CompanyMemberProps, CompanyMembersOptionsProps } from "@/utils/types";
import { AddCompanyMemberFormData } from "@/utils/validation-schemas/company-member.schema";
import { InviteEmployeeFormData } from "@/utils/validation-schemas/employee-invitation.schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

async function fetchCompanyMembers(
  companyId: string,
  options: CompanyMembersOptionsProps = {}
): Promise<CompanyMemberProps[]> {
  const params = new URLSearchParams();
  if (options.activeOnly) {
    params.append("activeOnly", "true");
  }
  if (options.locationId) {
    params.append("locationId", options.locationId);
  }

  const queryString = params.toString();
  const url = queryString
    ? `/api/companies/${companyId}/members?${queryString}`
    : `/api/companies/${companyId}/members`;

  const { data } = await axios.get(url);
  return data.members;
}

async function addCompanyMember(data: AddCompanyMemberFormData) {
  const { company_id, ...memberData } = data;
  const response = await axios.post(`/api/companies/${company_id}/members`, memberData);
  return response.data;
}

async function inviteEmployee(data: InviteEmployeeFormData) {
  const { company_id, ...invitationData } = data;
  const response = await axios.post(`/api/companies/${company_id}/members`, invitationData);
  return response.data;
}

export function useCompanyMembers(
  companyId: string,
  options: CompanyMembersOptionsProps = {}
) {
  return useQuery({
    queryKey: ["company-members", companyId, options],
    queryFn: () => fetchCompanyMembers(companyId, options),
    enabled: !!companyId,
  });
}

export function useAddCompanyMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addCompanyMember,
    onSuccess: () => {
      // Invalidate all company member queries
      queryClient.invalidateQueries({ queryKey: ["company-members"] });
      // Invalidate user-companies to refresh employee_count
      queryClient.invalidateQueries({ queryKey: ["user-companies"] });
    },
  });
}

export function useInviteEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: inviteEmployee,
    onSuccess: () => {
      // Invalidate all company member queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ["company-members"] });
      // Invalidate user-companies to refresh employee_count
      queryClient.invalidateQueries({ queryKey: ["user-companies"] });
    },
  });
}
