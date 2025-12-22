"use client";

import { Search, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/EmptyState";
import { useModal } from "@/contexts/ModalContext";
import { useCompanyContext } from "@/contexts/CompanyContext";
import { useLocations, useDeleteLocation } from "@/hooks/react-query/hooks/use-locations";
import { useSubscription } from "@/hooks/use-subscription";
import { LockedFeature } from "@/components/paywall/LockedFeature";
import Link from "next/link";
import { SubscriptionGuard } from "@/components/guards/SubscriptionGuard";
import { canCreateResource } from "@/lib/subscription/plans";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function LocationPage() {
  const { setOpenModal, showOverageWarning } = useModal();
  const { currentCompany } = useCompanyContext();
  const { canCreateLocation, locationLimitReason, currentCounts } =
    useSubscription();

  const { data: locations = [], isLoading } = useLocations(
    currentCompany?.company.id || "",
    {
      activeOnly: false,
    }
  );

  const deleteLocationMutation = useDeleteLocation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handleDeleteClick = (
    e: React.MouseEvent,
    locationId: string,
    locationName: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setLocationToDelete({ id: locationId, name: locationName });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!locationToDelete || !currentCompany) return;

    try {
      await deleteLocationMutation.mutateAsync({
        companyId: currentCompany.company.id,
        locationId: locationToDelete.id,
      });
      setDeleteDialogOpen(false);
      setLocationToDelete(null);
    } catch (error) {
      console.error("Failed to delete location:", error);
    }
  };

  const handleCreateLocation = () => {
    const check = canCreateResource(
      "location",
      currentCounts?.locations,
      currentCompany?.company?.current_plan,
      currentCompany?.company?.subscription_status
    );
    console.log({ check });
    if (check.willTriggerOverage) {
      showOverageWarning({
        resourceType: "location",
        currentCount: currentCounts?.locations,
        planLimit: check.limit!,
        overageCost: check.overageCost!,
        planName: check.planName!,
        onConfirm: () => {
          // Proceed with actual creation
          setOpenModal("addLocation");
        },
      });
    } else {
      setOpenModal("addLocation");
    }
  };

  const hasLocations = locations.length > 0;

  if (isLoading) {
    return (
      <section className="w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Locations</h1>
        </div>
        <div className="text-muted-foreground">Loading...</div>
      </section>
    );
  }

  if (!hasLocations) {
    return (
      <SubscriptionGuard feature="location settings">
        <EmptyState
          icon={Search}
          title="No locations found"
          description="You currently don't have any location yet."
          actionLabel="Add a new location"
          actionIcon={Plus}
          onAction={() => setOpenModal("addLocation")}
          actionDisabled={!canCreateLocation}
          actionLockReason={locationLimitReason}
        />
      </SubscriptionGuard>
    );
  }

  return (
    <SubscriptionGuard feature="location settings">
      <section className="w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Locations</h1>
          <LockedFeature
            isLocked={!canCreateLocation}
            reason={locationLimitReason}
            variant="disabled"
          >
            <Button
              onClick={() => handleCreateLocation()}
              disabled={!canCreateLocation}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Location
            </Button>
          </LockedFeature>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {locations.map((location) => (
            <div
              key={location.id}
              className="relative p-4 border border-subtle rounded-lg group"
            >
              <Link
                href={`/dashboard/${currentCompany?.company.slug}/${location.slug}/overview`}
                className="flex flex-col"
              >
                <h3 className="font-semibold text-base">{location.name}</h3>
                {location.address && (
                  <p className="text-sm text-muted-foreground">
                    {location.address}
                  </p>
                )}
              </Link>
              <button
                onClick={(e) =>
                  handleDeleteClick(e, location.id, location.name)
                }
                className="absolute cursor-pointer top-3 right-3 w-7 h-7 rounded-full bg-red-50 hover:bg-red-100 flex items-center justify-center"
                aria-label="Delete location"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            </div>
          ))}
        </div>

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Location</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete &quot;{locationToDelete?.name}
                &quot;? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={deleteLocationMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={deleteLocationMutation.isPending}
              >
                {deleteLocationMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </section>
    </SubscriptionGuard>
  );
}
