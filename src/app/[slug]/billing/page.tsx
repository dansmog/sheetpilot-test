"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    limits: [],
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
      { label: "Priority email and chat support", available: true },
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
      { label: "Dedicated account manager and priority support", available: true },
    ],
    recommended: false,
  },
];

export default function BillingPage() {
  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">
          Everything you need to manage your shifts
        </h1>
        <p className="text-text-secondary mt-2 text-lg">
          Choose the perfect plan for your business
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <button className="px-4 py-2 rounded-lg bg-bg-surface text-text-primary border border-border-subtle hover:bg-bg-surface-alt transition-colors">
          Pay monthly
        </button>
        <button className="px-4 py-2 rounded-lg bg-accent text-text-on-accent hover:bg-accent-hover transition-colors">
          Pay yearly
          <span className="ml-2 text-xs font-semibold">SAVE 20%</span>
        </button>
      </div>

      {/* Feature Pills */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <Check className="h-4 w-4 text-success" />
          <span>Per company shift portal</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <Check className="h-4 w-4 text-success" />
          <span>Familiar shift management via sheets</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <Check className="h-4 w-4 text-success" />
          <span>Enterprise grade analytics</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <Check className="h-4 w-4 text-success" />
          <span>Quick and effective customer support</span>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`relative flex flex-col ${
              plan.recommended
                ? "border-accent shadow-lg ring-2 ring-accent/20"
                : "border-border-subtle"
            }`}
          >
            {plan.recommended && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-accent text-text-on-accent hover:bg-accent-hover">
                  Recommended
                </Badge>
              </div>
            )}

            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-text-primary">
                {plan.name}
              </CardTitle>
              <CardDescription className="text-text-secondary text-sm">
                {plan.description}
              </CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold text-text-primary">
                  €{plan.price}
                </span>
                <span className="text-text-muted ml-2">/month</span>
              </div>
            </CardHeader>

            <CardContent className="flex-1 pb-4">
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-text-secondary">{feature}</span>
                  </li>
                ))}
              </ul>

              {plan.limits.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border-subtle">
                  {plan.limits.map((limit, index) => (
                    <p key={index} className="text-xs text-text-muted">
                      {limit.label}
                    </p>
                  ))}
                </div>
              )}
            </CardContent>

            <CardFooter>
              <Button
                className={`w-full ${
                  plan.recommended
                    ? "bg-accent text-text-on-accent hover:bg-accent-hover"
                    : "bg-bg-surface text-text-primary border border-border-subtle hover:bg-bg-surface-alt"
                }`}
              >
                Select {plan.name}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Additional Info */}
      <div className="mt-12 text-center">
        <p className="text-text-muted text-sm">
          All plans include a 14-day free trial. No credit card required.
        </p>
      </div>
    </div>
  );
}
