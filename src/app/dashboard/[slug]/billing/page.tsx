"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCompanyContext } from "@/contexts/CompanyContext";
import { useCreatePortalSession } from "@/hooks/react-query/hooks";
import { Badge } from "@/components/ui/badge";
import { Calendar, CreditCard, Loader2, ShieldCheck } from "lucide-react";
import { format } from "date-fns";

export default function BillingPage() {
  const { currentCompany, isLoading } = useCompanyContext();
  const { mutate: createPortalSession, isPending: isPortalLoading } =
    useCreatePortalSession();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!currentCompany) {
    return <div>Company not found</div>;
  }

  const subscription = currentCompany.company.subscriptions?.[0];
  const planName = currentCompany.company.current_plan || "Free";
  const isFree = planName.toLowerCase() === "free";

  const handleManageSubscription = () => {
    createPortalSession({
      companyId: currentCompany.company.id,
      returnUrl: window.location.href,
    });
  };

  return (
    <div className="w-full max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Billing & Invoices
        </h1>
        <p className="text-gray-600 mt-1">
          Manage your subscription, payment methods, and billing history.
        </p>
      </div>

      <div className=" border-1 pt-5 w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Subscription</CardTitle>
              <CardDescription>
                You are currently on the{" "}
                <span className="font-medium text-gray-900 capitalize">
                  {planName}
                </span>{" "}
                plan.
              </CardDescription>
            </div>
            <Badge
              variant={
                subscription?.status === "active" ? "default" : "secondary"
              }
              className="capitalize"
            >
              {subscription?.status || "Active"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 mt-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-4 rounded-lg border p-4">
              <div className="rounded-full bg-blue-100 p-2">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-sm text-gray-900">Plan Details</p>
                <p className="text-sm text-gray-500 capitalize">
                  {planName} Plan
                  {subscription?.billing_interval &&
                    ` (${subscription.billing_interval})`}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-lg border p-4">
              <div className="rounded-full bg-green-100 p-2">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-sm text-gray-900">Renewal Date</p>
                <p className="text-sm text-gray-500">
                  {subscription?.current_period_end
                    ? format(
                      new Date(subscription.current_period_end),
                      "MMMM d, yyyy"
                    )
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t bg-gray-50/50 px-6 py-4 mt-10">
          <div className="text-sm text-gray-500">
            {isFree
              ? "Upgrade to unlock more features."
              : "Manage your payment method and invoices in the portal."}
          </div>
          <Button
            onClick={handleManageSubscription}
            disabled={isPortalLoading || isFree}
            variant="outline"
            className="gap-2"
          >
            {isPortalLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CreditCard className="h-4 w-4" />
            )}
            Manage Subscription
          </Button>
        </CardFooter>
      </div>
    </div>
  );
}
