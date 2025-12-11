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
  const params = new URLSearchParams({ companyId });
  if (options.activeOnly) {
    params.append("activeOnly", "true");
  }

  const { data } = await axios.get(`/api/company-members?${params.toString()}`);
  return data.members;
}

async function addCompanyMember(data: AddCompanyMemberFormData) {
  const response = await axios.post("/api/company-members", data);
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
