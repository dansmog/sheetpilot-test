"use client";

import { CompanyProps, UserCompanyProps } from "@/utils/types";
import { CreateCompanyFormValues } from "@/utils/validation-schemas/company.schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useUserProfile } from "./use-user";

async function fetchCompany(companyId: string): Promise<CompanyProps> {
  const { data } = await axios.get(`/api/companies/${companyId}`);
  return data.company;
}

async function createCompany(data: CreateCompanyFormValues) {
  const response = await axios.post("/api/companies", data);
  return response.data;
}

export function useCompany(companyId: string) {
  return useQuery({
    queryKey: ["company", companyId],
    queryFn: () => fetchCompany(companyId),
    enabled: !!companyId,
  });
}
export function useCreateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCompany,
    onSuccess: () => {
      // Invalidate the user-companies query to refetch and update the list
      queryClient.invalidateQueries({ queryKey: ["user-companies"] });
    },
  });
}

async function checkSlugAvailability(
  slug: string
): Promise<{ available: boolean }> {
  const { data } = await axios.get(`/api/companies?slug=${slug}`);
  return data;
}

export function useCheckSlugAvailability(slug: string) {
  return useQuery({
    queryKey: ["slug-availability", slug],
    queryFn: () => checkSlugAvailability(slug),
    enabled: slug?.length > 2,
    staleTime: 0,
  });
}

async function fetchUserCompanies(userId: string): Promise<UserCompanyProps[]> {
  const { data } = await axios.get(`/api/companies?userId=${userId}`);
  return data.companies;
}

export function useUserCompanies() {
  const { data: userProfile } = useUserProfile();

  return useQuery({
    queryKey: ["user-companies"],
    queryFn: () => fetchUserCompanies(userProfile!.id),
    enabled: !!userProfile?.id,
  });
}
