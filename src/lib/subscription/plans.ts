import { PLANS, PlanId } from "@/config/pricing";

/**
 * Check if a company has an active subscription plan
 * @param currentPlan - The company's current plan (e.g., 'lite', 'starter')
 * @param subscriptionStatus - The subscription status (e.g., 'active', 'incomplete')
 * @returns true if the company has an active plan, false otherwise
 */
export function hasActivePlan(
  currentPlan: string | null | undefined,
  subscriptionStatus: string | null | undefined
): boolean {
  if (!currentPlan) return false;

  // Incomplete status means they haven't finished checkout
  if (subscriptionStatus === "incomplete") return false;

  const activeStatuses = ["active", "trialing"];
  return activeStatuses.includes(subscriptionStatus || "");
}

/**
 * Check if a company can create a specific resource based on their plan limits
 * Now allows overage (returns allowed: true) but provides warning info
 * @param resourceType - Type of resource ('employee' or 'location')
 * @param currentCount - Current count of the resource
 * @param currentPlan - The company's current plan
 * @param subscriptionStatus - The subscription status
 * @returns Object with allowed flag, limit, overage info, and optional reason
 */
export function canCreateResource(
  resourceType: "employee" | "location",
  currentCount: number | undefined,
  currentPlan: string | null | undefined,
  subscriptionStatus: string | null | undefined
): {
  allowed: boolean;
  limit: number | null;
  reason?: string;
  willTriggerOverage?: boolean;
  overageCost?: number;
  planName?: string;
} {
  // First check if they have an active plan
  if (!hasActivePlan(currentPlan, subscriptionStatus)) {
    return {
      allowed: false,
      limit: null,
      reason: "No active subscription. Please upgrade to create resources.",
    };
  }

  // Get the plan configuration
  const planConfig = PLANS[currentPlan as PlanId];
  if (!planConfig) {
    return {
      allowed: false,
      limit: null,
      reason: "Invalid plan configuration",
    };
  }

  // Get the limit and overage cost for this resource type
  const limit =
    resourceType === "employee"
      ? planConfig.limits.employees
      : planConfig.limits.locations;

  const overageCost =
    resourceType === "employee"
      ? planConfig.overageCost.employee
      : planConfig.overageCost.location;

  console.log({ currentCount });

  if (currentCount !== undefined && currentCount >= limit) {
    return {
      allowed: true,
      limit,
      willTriggerOverage: true,
      overageCost,
      planName: planConfig.name,
      reason: `You've reached the ${resourceType} limit for the ${
        planConfig.name
      } plan (${limit} ${resourceType}${limit > 1 ? "s" : ""}).`,
    };
  }

  return {
    allowed: true,
    limit,
    willTriggerOverage: false,
  };
}

/**
 * Get feature access information for the current plan
 * @param feature - Feature name to check
 * @param currentPlan - The company's current plan
 * @param subscriptionStatus - The subscription status
 * @returns Object with hasAccess flag and optional requiredPlan
 */
export function getFeatureAccess(
  feature: string,
  currentPlan: string | null,
  subscriptionStatus: string | null
): { hasAccess: boolean; requiredPlan?: string } {
  // Basic access check - all features require an active plan
  if (!hasActivePlan(currentPlan, subscriptionStatus)) {
    return {
      hasAccess: false,
      requiredPlan: "lite", // Minimum plan needed
    };
  }

  return {
    hasAccess: true,
  };
}

/**
 * Get plan limits for a specific plan
 * @param planId - The plan ID
 * @returns Object with employee and location limits
 */
export function getPlanLimits(planId: string | null): {
  employees: number;
  locations: number;
} | null {
  if (!planId || !(planId in PLANS)) {
    return null;
  }

  const plan = PLANS[planId as PlanId];
  return plan.limits;
}

/**
 * Get a user-friendly description of why a feature is locked
 * @param currentPlan - The company's current plan
 * @param subscriptionStatus - The subscription status
 * @returns User-friendly message explaining the lock
 */
export function getLockReason(
  currentPlan: string | null,
  subscriptionStatus: string | null
): string {
  if (!currentPlan || subscriptionStatus === "incomplete") {
    return "This feature requires an active subscription. Please choose a plan to continue.";
  }

  if (subscriptionStatus === "past_due") {
    return "Your subscription payment is past due. Please update your payment method to regain access.";
  }

  if (subscriptionStatus === "canceled") {
    return "Your subscription has been canceled. Reactivate your subscription to access this feature.";
  }

  return "This feature is not available on your current plan.";
}
