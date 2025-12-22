import { useMemo } from "react";
import { useCompanyContext } from "@/contexts/CompanyContext";
import {
  hasActivePlan,
  canCreateResource,
  getPlanLimits,
  getLockReason,
} from "@/lib/subscription/plans";

export function useSubscription() {
  const { currentCompany } = useCompanyContext();

  const subscriptionData = useMemo(() => {
    if (!currentCompany) {
      return {
        hasActivePlan: false,
        currentPlan: null,
        subscriptionStatus: null,
        canCreateLocation: false,
        canCreateEmployee: false,
        currentLimits: { employees: 0, locations: 0 },
        upgradeUrl: "/upgrade",
        lockReason: "No company selected",
        subscriptions: [],
      };
    }

    const { current_plan, subscription_status, location_count, employee_count, subscriptions } =
      currentCompany.company;

    const isActivePlan = hasActivePlan(current_plan, subscription_status);
    const limits = getPlanLimits(current_plan) || { employees: 0, locations: 0 };

    // Check if company can create resources
    const locationCheck = canCreateResource(
      "location",
      location_count,
      current_plan,
      subscription_status
    );

    const employeeCheck = canCreateResource(
      "employee",
      employee_count,
      current_plan,
      subscription_status
    );

    return {
      hasActivePlan: isActivePlan,
      currentPlan: current_plan,
      subscriptionStatus: subscription_status,
      canCreateLocation: locationCheck.allowed,
      canCreateEmployee: employeeCheck.allowed,
      currentLimits: limits,
      currentCounts: {
        locations: location_count,
        employees: employee_count,
      },
      upgradeUrl: `/upgrade?companyId=${currentCompany.company.id}`,
      lockReason: getLockReason(current_plan, subscription_status),
      locationLimitReason: locationCheck.reason,
      employeeLimitReason: employeeCheck.reason,
      subscriptions: subscriptions || [],
      // New fields for plan switching
      billingInterval: subscriptions?.[0]?.billing_interval || null,
      scheduledPlanChange: currentCompany.company.scheduled_plan_change,
      scheduledChangeDate: currentCompany.company.scheduled_change_date,
    };
  }, [currentCompany]);

  return subscriptionData;
}
