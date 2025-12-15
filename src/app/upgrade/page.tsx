"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const plans = [
  {
    name: "Lite",
    price: 5,
    description: "Perfect for small businesses getting started",
    features: [
      "Up to 5 employees included",
      "1 location included",
      "Basic scheduling features",
      "Email support",
    ],
    limits: [
      { label: "Priority email support", available: false },
      { label: "Every new employee cost €2.5 ", available: false },
      { label: "Every new Location cost €3.5", available: false },
    ],
    recommended: false,
  },
  {
    name: "Starter",
    price: 30,
    description: "Great for growing small to medium businesses",
    features: [
      "Up to 15 employees included",
      "3 locations included",
      "Advanced scheduling features",
      "Basic analytics",
      "Priority support",
    ],
    limits: [
      { label: "Priority email support", available: false },
      { label: "Every new employee cost €2.5 ", available: false },
      { label: "Every new Location cost €2.5", available: false },
    ],
    recommended: true,
  },
  {
    name: "Growth",
    price: 60,
    description: "Ideal for established businesses with multiple locations",
    features: [
      "Up to 50 employees included",
      "10 locations included",
      "Advanced scheduling features",
      "Advanced analytics",
      "Custom shift templates",
      "Priority support",
    ],
    limits: [
      { label: "Priority email support", available: false },
      { label: "Every new employee cost €1.5 ", available: false },
      { label: "Every new Location cost €1.5", available: false },
    ],
    recommended: false,
  },
  {
    name: "Scale",
    price: 120,
    description: "For large enterprises with complex scheduling needs",
    features: [
      "Up to 200 employees included",
      "25 locations included",
      "Enterprise scheduling features",
      "Advanced analytics & reporting",
      "Custom integrations",
      "Dedicated account manager",
      "Priority support",
    ],
    limits: [
      {
        label: "Dedicated account manager and priority support",
        available: true,
      },

      { label: "Priority email support", available: false },
      { label: "Every new employee cost €1.0 ", available: false },
      { label: "Every new Location cost €2.0", available: false },
    ],
    recommended: false,
  },
];

export default function UpgradePage() {
  const router = useRouter();
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annually">(
    "monthly"
  );

  return (
    <div className="w-full mx-auto px-5 md:px-10 py-12">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="group flex cursor-pointer items-center gap-2 text-gray-600 hover:text-brand-2 mb-8 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:animate-bounce group-hover:-translate-x-1" />
        <span className="text-sm font-medium">Back to Dashboard</span>
      </button>

      <div className="text-center mb-8">
        <p className="text-xs font-semibold text-brand-2 uppercase tracking-wider mb-2">
          PRICING
        </p>
        <h1 className="text-xl md:text-3xl font-bold text-gray-900">
          Choose the plan that fits your needs
        </h1>
      </div>

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
            Save 30%
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative flex flex-col rounded-2xl ${
              plan.recommended
                ? "border-2 border-brand-2 shadow-xl bg-linear-to-b from-purple-50/50 to-white"
                : "border border-gray-200 bg-white"
            }`}
          >
            {plan.recommended && (
              <div className="absolute -top-3 right-6">
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border border-green-200 rounded-full px-3 py-1 text-xs">
                  Most popular
                </Badge>
              </div>
            )}

            <CardHeader className="pb-6 pt-8">
              <CardTitle className="text-xl font-semibold text-gray-900">
                {plan.name}
              </CardTitle>
              <div className="mt-4">
                <span className="text-5xl font-bold text-gray-900">
                  €{plan.price}
                </span>
                <span className="text-gray-500 ml-1">/mo</span>
              </div>
            </CardHeader>

            <CardContent className="flex-1 pb-6 px-6">
              <Button
                className={`w-full mb-6 rounded-xl py-4 ${
                  plan.recommended
                    ? "bg-brand-2 text-white hover:bg-purple-700"
                    : "bg-white text-gray-900 border-2 border-brand-2 hover:bg-purple-50"
                }`}
              >
                Buy Plan
              </Button>

              {/* Payment Icons */}
              <div className="flex items-center justify-center gap-3 mb-6 pb-6 border-b border-gray-200">
                <div className="text-xs font-semibold text-blue-800">VISA</div>
                <div className="w-6 h-4 bg-linear-to-r from-orange-500 to-red-500 rounded"></div>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10"
                    fill="#34A853"
                  />
                  <path d="M12 2v10l8.66 5" fill="#FBBC04" />
                  <path d="M12 12l8.66 5" fill="#EA4335" />
                </svg>
                <div className="text-xs font-semibold text-blue-600">
                  PayPal
                </div>
                <div className="text-xs font-semibold text-gray-900">Pay</div>
              </div>

              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="flex justify-center items-center h-5 w-5 shrink-0 mt-0.5 bg-brand-2 rounded-full">
                      <Check className="h-4 w-4 text-white" />
                    </span>
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {plan.limits.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  {plan.limits.map((limit, index) => (
                    <p key={index} className="text-xs text-gray-500">
                      {limit.label}
                    </p>
                  ))}
                </div>
              )}
            </CardContent>
          </div>
        ))}
      </div>
    </div>
  );
}
