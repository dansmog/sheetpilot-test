"use client";

import { CompanyProps } from "@/utils/types";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

async function fetchCompany(companyId: string): Promise<CompanyProps> {
  const { data } = await axios.get(`/api/companies?companyId=${companyId}`);
  return data.company;
}

export function useCompany(companyId: string) {
  return useQuery({
    queryKey: ["company", companyId],
    queryFn: () => fetchCompany(companyId),
    enabled: !!companyId,
  });
}
