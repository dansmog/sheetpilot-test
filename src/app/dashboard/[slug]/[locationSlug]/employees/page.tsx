"use client";

import { useLocationContext } from "@/contexts/LocationContext";
import { SubscriptionGuard } from "@/components/guards/SubscriptionGuard";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import { useModal } from "@/contexts/ModalContext";
import { useCompanyContext } from "@/contexts/CompanyContext";
import { useSubscription } from "@/hooks/use-subscription";
import { LockedFeature } from "@/components/paywall/LockedFeature";
import { canCreateResource } from "@/lib/subscription/plans";
import { useCompanyMembers } from "@/hooks/react-query/hooks/use-company-members";
import { EmptyState } from "@/components/common/EmptyState";
import { DataTable } from "@/components/ui/data-table";
import { memberColumns } from "@/components/members/member-columns";

export default function LocationEmployeesPage() {
  const { currentLocation } = useLocationContext();
  const { setOpenModal, showOverageWarning } = useModal();
  const { currentCompany } = useCompanyContext();
  const { canCreateEmployee, employeeLimitReason, currentCounts } =
    useSubscription();

  const { data: members = [], isLoading } = useCompanyMembers(
    currentCompany?.company.id || "",
    {
      activeOnly: false, // Show all members including pending
      locationId: currentLocation?.id, // Filter by location
    }
  );

  console.log({ currentCompany });

  const handleAddEmployee = () => {
    const check = canCreateResource(
      "employee",
      currentCounts?.employees,
      currentCompany?.company?.current_plan,
      currentCompany?.company?.subscription_status
    );

    if (check.willTriggerOverage) {
      showOverageWarning({
        resourceType: "employee",
        currentCount: currentCounts?.employees,
        planLimit: check.limit!,
        overageCost: check.overageCost!,
        planName: check.planName!,
        onConfirm: () => {
          setOpenModal("addEmployee");
        },
      });
    } else {
      setOpenModal("addEmployee");
    }
  };

  const hasMembers = members.length > 0;

  if (isLoading) {
    return (
      <SubscriptionGuard
        feature="employee management"
        bannerMessage="Upgrade your plan to manage employees and team members."
      >
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Employees</h1>
          </div>
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </SubscriptionGuard>
    );
  }

  if (!hasMembers) {
    return (
      <SubscriptionGuard
        feature="employee management"
        bannerMessage="Upgrade your plan to manage employees and team members."
      >
        <EmptyState
          icon={Users}
          title="No employees found"
          description={`No employees assigned to ${
            currentLocation?.name || "this location"
          } yet.`}
          actionLabel="Add Employee"
          actionIcon={Plus}
          onAction={handleAddEmployee}
          actionDisabled={!canCreateEmployee}
          actionLockReason={employeeLimitReason}
        />
      </SubscriptionGuard>
    );
  }

  return (
    <SubscriptionGuard
      feature="employee management"
      bannerMessage="Upgrade your plan to manage employees and team members."
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Employees</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage employees at {currentLocation?.name || "this location"}
            </p>
          </div>
          <LockedFeature
            isLocked={!canCreateEmployee}
            reason={employeeLimitReason}
            variant="disabled"
          >
            <Button
              onClick={handleAddEmployee}
              disabled={!canCreateEmployee}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Employee
            </Button>
          </LockedFeature>
        </div>

        <DataTable
          columns={memberColumns}
          data={members}
          searchKey="name"
          searchPlaceholder="Search employees..."
        />
      </div>
    </SubscriptionGuard>
  );
}
