"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BillingPage() {
  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Billing & Invoices
        </h1>
        <p className="text-gray-600 mt-1">
          Manage your billing information, payment methods, and view invoices.
        </p>
      </div>

      <div className="space-y-6"></div>
    </div>
  );
}
