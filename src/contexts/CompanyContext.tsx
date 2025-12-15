"use client";

import React, { createContext, useContext, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUserCompanies } from "@/hooks/react-query/hooks";
import { UserCompanyProps } from "@/utils/types";

interface CompanyContextType {
  currentCompany: UserCompanyProps | null;
  companies: UserCompanyProps[];
  switchCompany: (company: UserCompanyProps) => void;
  isLoading: boolean;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function CompanyProvider({
  children,
  slug,
}: {
  children: React.ReactNode;
  slug?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  // Fetch all companies using TanStack Query (with caching)
  const { data: companies = [], isLoading, error } = useUserCompanies();

  console.log("CompanyContext:", {
    companies,
    companiesLength: companies.length,
    isLoading,
    error,
    slug,
  });

  const currentCompany = useMemo(() => {
    if (!slug || !companies.length) return null;
    return companies.find((c) => c.company.slug === slug) || null;
  }, [slug, companies]);

  const switchCompany = (company: UserCompanyProps) => {
    if (pathname) {
      const pathParts = pathname.split("/");
      const dashboardIndex = pathParts.indexOf("dashboard");

      if (dashboardIndex !== -1 && pathParts[dashboardIndex + 1]) {
        pathParts[dashboardIndex + 1] = company.company.slug;
        const newPath = pathParts.join("/");
        router.push(newPath);
      } else {
        router.push(`/${company.company.slug}`);
      }
    }
  };

  return (
    <CompanyContext.Provider
      value={{
        currentCompany,
        companies,
        switchCompany,
        isLoading,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompanyContext() {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error("useCompanyContext must be used within a CompanyProvider");
  }
  return context;
}
