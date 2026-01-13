"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import axios from "axios";

import { useRouter, useSearchParams } from "next/navigation";
import { Check, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PLANS, PlanId } from "@/config/pricing";
import { toast } from "sonner";
import { useCompanyContext } from "@/contexts/CompanyContext";
import { useSubscription } from "@/hooks/use-subscription";
import Logo from "../../images/logo.svg";

// 1. Map your Marketing Content to your Logical IDs
const PLAN_CONTENT: Record<
  PlanId,
  {
    description: string;
    features: string[];
    limits: { label: string; available: boolean }[];
    recommended?: boolean;
    monthlyPrice: number;
    yearlyPrice: number;
  }
> = {
  lite: {
    description: "Perfect for small businesses getting started",
    monthlyPrice: 5,
    yearlyPrice: 50, // Usually 10x or 12x
    features: [
      "Up to 5 employees included",
      "1 location included",
      "Basic scheduling features",
      "Email support",
    ],
    limits: [
      { label: "Priority email support", available: false },
      { label: "Every new employee cost €2.00 ", available: false },
      { label: "Every new Location cost €15.00", available: false },
    ],
  },
  starter: {
    description: "Great for growing small to medium businesses",
    monthlyPrice: 30,
    yearlyPrice: 300,
    recommended: true,
    features: [
      "Up to 15 employees included",
      "3 locations included",
      "Advanced scheduling features",
      "Basic analytics",
      "Priority support",
    ],
    limits: [
      { label: "Priority email support", available: false },
      { label: "Every new employee cost €2.50 ", available: false },
      { label: "Every new Location cost €10.00", available: false },
    ],
  },
  growth: {
    description: "Ideal for established businesses with multiple locations",
    monthlyPrice: 60,
    yearlyPrice: 600,
    features: [
      "Up to 50 employees included",
      "10 locations included",
      "Advanced scheduling features",
      "Advanced analytics",
      "Priority support",
    ],
    limits: [
      { label: "Priority email support", available: false },
      { label: "Every new employee cost €1.50 ", available: false },
      { label: "Every new Location cost €5.00", available: false },
    ],
  },
  scale: {
    description: "For large enterprises with complex scheduling needs",
    monthlyPrice: 120,
    yearlyPrice: 1200,
    features: [
      "Up to 200 employees included",
      "25 locations included",
      "Enterprise scheduling features",
      "Advanced analytics & reporting",
      "Dedicated account manager",
    ],
    limits: [
      { label: "Dedicated account manager", available: true },
      { label: "Every new employee cost €1.00 ", available: false },
      { label: "Every new Location cost €2.50", available: false },
    ],
  },
};

function UpgradePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { companies } = useCompanyContext();
  const [selectedCompany, setSelectedCompany] = useState<
    (typeof companies)[0] | null
  >(null);
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null);

  // Get subscription data from selectedCompany
  const currentPlan = selectedCompany?.company.current_plan;
  const billingInterval =
    selectedCompany?.company.subscriptions?.[0]?.billing_interval;

  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">(
    "monthly"
  );

  // Update billing period when selectedCompany or billingInterval changes
  useEffect(() => {
    if (billingInterval) {
      setBillingPeriod(billingInterval === "month" ? "monthly" : "yearly");
    }
  }, [billingInterval]);

  // Set company based on URL companyId parameter or default to first company
  useEffect(() => {
    if (companies.length === 0) return;

    const companyIdFromUrl = searchParams.get("companyId");

    if (companyIdFromUrl) {
      // Find company by ID from URL
      const companyFromUrl = companies.find(
        (c) => c.company.id === companyIdFromUrl
      );
      if (companyFromUrl) {
        setSelectedCompany(companyFromUrl);
        return;
      }
    }

    // Default to first company if no URL param or company not found
    if (!selectedCompany) {
      setSelectedCompany(companies[0]);
    }
  }, [companies, searchParams, selectedCompany]);

  const handleCompanyChange = (companySlug: string) => {
    const selectedActiveCompany = companies.find(
      (c) => c.company.slug === companySlug
    );
    if (selectedActiveCompany) {
      setSelectedCompany(selectedActiveCompany);
    }
  };

  // 2. The Checkout Handler
  const handleCheckout = async (planKey: PlanId) => {
    if (!selectedCompany) {
      toast.error("Please select a company first");
      return;
    }

    setLoadingPlan(planKey);
    try {
      const { data } = await axios.post("/api/stripe/checkout", {
        planId: planKey,
        interval: billingPeriod,
        companyId: selectedCompany.company.id,
      });

      if (data.url) {
        // New subscription - redirect to Stripe Checkout
        window.location.href = data.url;
      } else if (data.success) {
        // Plan switch - show success message and redirect
        toast.success(data.message);
        setTimeout(() => {
          router.push(`/dashboard/${selectedCompany.company.slug}`);
        }, 1500);
      }
    } catch (error) {
      console.error(error);
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.error
        : "Failed to initiate checkout";
      toast.error(errorMessage);
    } finally {
      setLoadingPlan(null);
    }
  };

  // Page title changes based on whether user has active plan
  const pageTitle = currentPlan
    ? "Change Your Plan"
    : "Choose the plan that fits";
  const pageSubtitle = currentPlan
    ? "Upgrade or downgrade your subscription anytime"
    : null;

  return (
    <div className="w-full mx-auto px-5 md:px-10 py-12">
      <div className="w-full items-center gap-4 flex mb-8">
        <Image src={Logo} alt="SheetPilot Logo" className="h-5 w-auto" />
        <button
          onClick={() => router.back()}
          className="group flex cursor-pointer items-center gap-2 text-gray-600 hover:text-brand-2 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 transition-transform" />
          <span className="text-sm font-medium">Back to Dashboard</span>
        </button>
      </div>

      <div className="text-center mb-8">
        <p className="text-xs font-semibold text-brand-2 uppercase tracking-wider mb-2">
          PRICING
        </p>
        <h1 className="text-xl md:text-3xl font-bold text-gray-900 flex flex-wrap items-center justify-center gap-2">
          <span>{pageTitle}</span>
          {companies.length > 1 ? (
            <Select
              value={selectedCompany?.company.slug || ""}
              onValueChange={handleCompanyChange}
            >
              <SelectTrigger className="w-auto inline-flex h-auto p-0 border-0 shadow-none bg-transparent hover:bg-transparent focus:ring-0 focus:ring-offset-0 text-brand-2 font-bold text-xl md:text-3xl gap-1">
                <SelectValue placeholder="your company" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {companies.map((company) => (
                    <SelectItem
                      key={company.company.slug}
                      value={company.company.slug}
                    >
                      {company.company.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          ) : selectedCompany ? (
            <span className="text-brand-2">{selectedCompany.company.name}</span>
          ) : (
            <span className="text-brand-2">your company</span>
          )}
          {!currentPlan && <span>needs</span>}
        </h1>
        {pageSubtitle && (
          <p className="text-sm text-gray-600 mt-2">{pageSubtitle}</p>
        )}
      </div>

      <div className="flex border p-1 border-gray-100 rounded-full w-fit mx-auto items-center justify-center gap-1 mb-12">
        <button
          onClick={() => setBillingPeriod("monthly")}
          className={`px-6 py-2 rounded-full transition-colors ${billingPeriod === "monthly"
            ? "bg-purple-50 text-gray-900"
            : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setBillingPeriod("yearly")}
          className={`px-6 py-2 rounded-full transition-colors ${billingPeriod === "yearly"
            ? "bg-purple-50 text-gray-900"
            : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
        >
          <span>Annually</span>
          <span className="ml-2 text-xs font-semibold text-brand-2">
            Save ~17%
          </span>
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-2">
        {(Object.keys(PLANS) as PlanId[]).map((planKey) => {
          const content = PLAN_CONTENT[planKey];
          const price =
            billingPeriod === "monthly"
              ? content.monthlyPrice
              : content.yearlyPrice;

          const isCurrentPlan = currentPlan === planKey;

          // Calculate if this is an upgrade or downgrade
          const PLAN_RANK: Record<PlanId, number> = {
            lite: 1,
            starter: 2,
            growth: 3,
            scale: 4,
          };
          const isUpgrade =
            currentPlan &&
            PLAN_RANK[planKey] > PLAN_RANK[currentPlan as PlanId];
          const isDowngrade =
            currentPlan &&
            PLAN_RANK[planKey] < PLAN_RANK[currentPlan as PlanId];

          // Button text logic
          let buttonText = "Buy Plan";
          if (loadingPlan === planKey) {
            buttonText = "Processing...";
          } else if (isCurrentPlan) {
            // Check if it's the same interval
            const currentInterval = billingInterval === "month" ? "monthly" : "yearly";
            if (currentInterval === billingPeriod) {
              buttonText = "Current Plan";
            } else {
              buttonText = billingPeriod === "monthly" ? "Switch to Monthly" : "Switch to Annual";
            }
          } else if (currentPlan) {
            if (isUpgrade) {
              buttonText = `Upgrade to ${PLANS[planKey].name}`;
            } else if (isDowngrade) {
              buttonText = `Downgrade to ${PLANS[planKey].name}`;
            }
          }

          return (
            <div
              key={planKey}
              className={`relative flex flex-col rounded-2xl ${content.recommended
                ? "border-2 border-brand-2 shadow-xl bg-linear-to-b from-purple-50/50 to-white"
                : "border border-gray-200 bg-white"
                }`}
            >
              {/* Active badge for current plan */}
              {isCurrentPlan && (
                <div className="absolute -top-3 left-6">
                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-full px-3 py-1 text-xs">
                    Active
                  </Badge>
                </div>
              )}
              {content.recommended && (
                <div className="absolute -top-3 right-6">
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border border-green-200 rounded-full px-3 py-1 text-xs">
                    Most popular
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-6 pt-4 md:pt-8">
                <CardTitle className="text-sm md:text-xl font-semibold text-gray-900">
                  {PLANS[planKey].name} {/* Uses name from Config */}
                </CardTitle>
                <div className="mt-4">
                  <span className="text-5xl font-bold text-gray-900">
                    €{price}
                  </span>
                  <span className="text-gray-500 ml-1">
                    /{billingPeriod === "monthly" ? "mo" : "yr"}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {content.description}
                </p>
              </CardHeader>

              <CardContent className="flex-1 pb-6 px-4 md:px-6">
                <Button
                  onClick={() => handleCheckout(planKey)}
                  disabled={(isCurrentPlan && (billingInterval === "month" ? "monthly" : "yearly") === billingPeriod) || loadingPlan !== null}
                  className={`w-full mb-6 rounded-xl py-4 ${content.recommended
                    ? "bg-brand-2 text-white hover:bg-purple-700"
                    : "bg-white text-gray-900 border-2 border-brand-2 hover:bg-purple-50"
                    }`}
                >
                  {loadingPlan === planKey ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />{" "}
                      Processing...
                    </>
                  ) : (
                    buttonText
                  )}
                </Button>

                {/* Features List */}
                <ul className="space-y-3">
                  {content.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="flex justify-center items-center h-5 w-5 shrink-0 mt-0.5 bg-brand-2 rounded-full">
                        <Check className="h-4 w-4 text-white" />
                      </span>
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Limits List */}
                {content.limits.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    {content.limits.map((limit, index) => (
                      <p key={index} className="text-xs text-gray-500 mb-1">
                        • {limit.label}
                      </p>
                    ))}
                  </div>
                )}
              </CardContent>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function UpgradePage() {
  return (
    <Suspense
      fallback={
        <div className="w-full mx-auto px-5 md:px-10 py-12 flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-brand-2" />
        </div>
      }
    >
      <UpgradePageContent />
    </Suspense>
  );
}
