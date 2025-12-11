"use client";

import { CompanyProps, UserCompanyProps } from "@/utils/types";
import { CreateCompanyFormValues } from "@/utils/validation-schemas/company.schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";

async function fetchCompany(companyId: string): Promise<CompanyProps> {
  const { data } = await axios.get(`/api/companies?companyId=${companyId}`);
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
  return useMutation({
    mutationFn: createCompany,
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

async function fetchUserCompanies(): Promise<UserCompanyProps[]> {
  const { data } = await axios.get("/api/user/companies");
  return data.companies;
}

export function useUserCompanies() {
  return useQuery({
    queryKey: ["user-companies"],
    queryFn: fetchUserCompanies,
    staleTime: 5 * 60 * 1000, // 5 minutes - companies don't change often
  });
}
