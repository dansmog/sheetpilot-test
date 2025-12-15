"use client";

import { CompanyMember } from "@/lib/supabase/company-members/queries";
import { AddCompanyMemberFormData } from "@/utils/validation-schemas/company-member.schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

interface CompanyMembersOptionsProps {
  activeOnly?: boolean;
}

async function fetchCompanyMembers(
  companyId: string,
  options: CompanyMembersOptionsProps = {}
): Promise<CompanyMember[]> {
  const params = new URLSearchParams();
  if (options.activeOnly) {
    params.append("activeOnly", "true");
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
    },
  });
}
