"use client";

import { useSubscription } from "@/hooks/use-subscription";
import { Banner } from "@/components/common/Banner";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface SubscriptionGuardProps {
  children: React.ReactNode;
  feature?: string;
  description?: string;
  bannerMessage?: string;
}

export function SubscriptionGuard({
  children,
  feature = "this feature",
  description,
  bannerMessage,
}: SubscriptionGuardProps) {
  const { hasActivePlan, upgradeUrl, lockReason } = useSubscription();

  // If no active plan, show banner at top and content below
  if (!hasActivePlan) {
    const message =
      bannerMessage ||
      description ||
      lockReason ||
      `Access to ${feature} requires an active subscription plan.`;

    return (
      <div className="flex flex-col gap-6">
        <Banner variant="upgrade">
          <div className="flex items-center justify-between gap-4">
            <div className="">
              <h6 className="font-semibold">
                You currently have no active plan
              </h6>
              <span>{message}</span>
            </div>
            <Button asChild size="sm" className="shrink-0">
              <Link href={upgradeUrl}>Upgrade Now</Link>
            </Button>
          </div>
        </Banner>
        {children}
      </div>
    );
  }

  // If has active plan, render children normally
  return <>{children}</>;
}
