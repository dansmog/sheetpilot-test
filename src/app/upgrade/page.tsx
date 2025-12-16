"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ArrowLeft, Loader2 } from "lucide-react"; // Added Loader2
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"; // Assuming you have a toast component
import { PLANS, PlanId } from "@/config/pricing"; // ✅ Import your config
import { toast } from "sonner";

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

export default function UpgradePage({ companyId }: { companyId: string }) {
  const router = useRouter();
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annually">(
    "monthly"
  );
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null);

  // 2. The Checkout Handler
  const handleCheckout = async (planKey: PlanId) => {
    setLoadingPlan(planKey);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: planKey,
          interval: billingPeriod === "monthly" ? "month" : "year",
          companyId: companyId, // Passed from prop or context
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Checkout failed");
      if (data.url) window.location.href = data.url; // Redirect to Stripe
    } catch (error) {
      console.error(error);
      toast.error("faile");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="w-full mx-auto px-5 md:px-10 py-12">
      {/* ... (Header and Back Button code remains same) ... */}

      {/* Toggle */}
      <div className="flex border p-1 border-gray-100 rounded-full w-fit mx-auto items-center justify-center gap-1 mb-12">
        <button
          onClick={() => setBillingPeriod("monthly")}
          className={`px-6 py-2 rounded-full transition-colors ${
            billingPeriod === "monthly"
              ? "bg-purple-50 text-gray-900"
              : "bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setBillingPeriod("annually")}
          className={`px-6 py-2 rounded-full transition-colors ${
            billingPeriod === "annually"
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {(Object.keys(PLANS) as PlanId[]).map((planKey) => {
          const content = PLAN_CONTENT[planKey];
          const price =
            billingPeriod === "monthly"
              ? content.monthlyPrice
              : content.yearlyPrice;

          return (
            <div
              key={planKey}
              className={`relative flex flex-col rounded-2xl ${
                content.recommended
                  ? "border-2 border-brand-2 shadow-xl bg-gradient-to-b from-purple-50/50 to-white"
                  : "border border-gray-200 bg-white"
              }`}
            >
              {content.recommended && (
                <div className="absolute -top-3 right-6">
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border border-green-200 rounded-full px-3 py-1 text-xs">
                    Most popular
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-6 pt-8">
                <CardTitle className="text-xl font-semibold text-gray-900">
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

              <CardContent className="flex-1 pb-6 px-6">
                <Button
                  onClick={() => handleCheckout(planKey)}
                  disabled={loadingPlan !== null}
                  className={`w-full mb-6 rounded-xl py-4 ${
                    content.recommended
                      ? "bg-brand-2 text-white hover:bg-purple-700"
                      : "bg-white text-gray-900 border-2 border-brand-2 hover:bg-purple-50"
                  }`}
                >
                  {loadingPlan === planKey ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    "Buy Plan"
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
