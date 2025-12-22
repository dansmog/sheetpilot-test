"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Building2, Plus } from "lucide-react";
import { useUserCompanies } from "@/hooks/react-query/hooks/use-company";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useModal } from "@/contexts/ModalContext";

// Helper function to get badge variant and label for plan
const getPlanBadge = (plan: string | null, status: string | null) => {
  if (!plan || status === "incomplete") {
    return {
      label: "No Plan",
      variant: "secondary" as const,
      className: "bg-gray-100 text-gray-700 hover:bg-gray-100",
    };
  }

  const planLabels: Record<string, string> = {
    lite: "Lite Plan",
    starter: "Starter Plan",
    growth: "Growth Plan",
    scale: "Scale Plan",
  };

  const planColors: Record<string, string> = {
    lite: "bg-blue-100 text-blue-700 hover:bg-blue-100",
    starter: "bg-green-100 text-green-700 hover:bg-green-100",
    growth: "bg-purple-100 text-purple-700 hover:bg-purple-100",
    scale: "bg-orange-100 text-orange-700 hover:bg-orange-100",
  };

  return {
    label: planLabels[plan] || `${plan} Plan`,
    variant: "secondary" as const,
    className: planColors[plan] || "bg-gray-100 text-gray-700 hover:bg-gray-100",
  };
};

export default function OrganizationsPage() {
  const router = useRouter();
  const { data: companies, isLoading, error } = useUserCompanies();
  const { setOpenModal } = useModal();

  useEffect(() => {
    if (isLoading) return;

    if (error) {
      console.error("Error fetching companies:", error);
      router.push("/auth/login");
      return;
    }

    if (!companies || companies.length === 0) {
      router.push("/onboarding/company");
      return;
    }

    if (companies.length === 1) {
      router.push(`/dashboard/${companies[0].company.slug}/locations`);
    }
  }, [companies, isLoading, error, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto" />
          <p className="mt-4 text-sm text-gray-600">Loading organizations...</p>
        </div>
      </div>
    );
  }

  if (!companies) {
    return null;
  }

  return (
    <div className="flex min-h-screen px-4 py-20">
      <div className="w-full max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">
            Your Organization
          </h1>
          <Button onClick={() => setOpenModal("addCompany")} className="gap-2">
            <Plus className="w-4 h-4" />
            Add a new company
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => {
            const planBadge = getPlanBadge(
              company.company.current_plan,
              company.company.subscription_status
            );

            return (
              <Link
                href={`/dashboard/${company.company.slug}/locations`}
                key={company.company.id}
                className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 p-4 border border-subtle rounded-lg"
              >
                <div className="flex gap-2">
                  <Building2 className="h-4 w-4 text-black mt-1" />

                  <div className="flex flex-col gap-2 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base font-semibold text-gray-900">
                        {company.company.name}
                      </h3>
                      <Badge
                        variant={planBadge.variant}
                        className={`${planBadge.className} text-xs`}
                      >
                        {planBadge.label}
                      </Badge>
                    </div>
                    <p className="text-sm flex items-center gap-3 text-gray-500 capitalize">
                      {company.role}{" "}
                      <span className="h-1 w-1 rounded-full bg-gray-400 flex"></span>
                      {company.company.location_count}{" "}
                      {company.company.location_count === 1
                        ? "location"
                        : "locations"}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
