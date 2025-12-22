"use client";

import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import { useModal } from "@/contexts/ModalContext";
import { useCompanyContext } from "@/contexts/CompanyContext";
import { useSubscription } from "@/hooks/use-subscription";
import { LockedFeature } from "@/components/paywall/LockedFeature";
import { canCreateResource } from "@/lib/subscription/plans";
import { SubscriptionGuard } from "@/components/guards/SubscriptionGuard";
import { EmptyState } from "@/components/common/EmptyState";
import { useCompanyMembers } from "@/hooks/react-query/hooks/use-company-members";
import { DataTable } from "@/components/ui/data-table";
import { memberColumns } from "@/components/members/member-columns";

export default function MembersPage() {
  const { setOpenModal, showOverageWarning } = useModal();
  const { currentCompany } = useCompanyContext();
  const { canCreateEmployee, employeeLimitReason, currentCounts } =
    useSubscription();

  const { data: members = [], isLoading } = useCompanyMembers(
    currentCompany?.company.id || "",
    {
      activeOnly: false, // Show all members including pending invitations
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
      <SubscriptionGuard feature="member management">
        <section className="w-full p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold">Members</h1>
          </div>
          <div className="text-muted-foreground">Loading...</div>
        </section>
      </SubscriptionGuard>
    );
  }

  if (!hasMembers) {
    return (
      <SubscriptionGuard feature="member management">
        <EmptyState
          icon={Users}
          title="No members found"
          description="You currently don't have any team members yet."
          actionLabel="Invite an employee"
          actionIcon={Plus}
          onAction={handleAddEmployee}
          actionDisabled={!canCreateEmployee}
          actionLockReason={employeeLimitReason}
        />
      </SubscriptionGuard>
    );
  }

  return (
    <SubscriptionGuard feature="member management">
      <section className="w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Members</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage all team members across all locations
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
          searchPlaceholder="Search members..."
        />
      </section>
    </SubscriptionGuard>
  );
}
