"use client";

import { useLocationContext } from "@/contexts/LocationContext";
import { SubscriptionGuard } from "@/components/guards/SubscriptionGuard";

export default function LocationShiftsPage() {
  const { currentLocation } = useLocationContext();

  return (
    <SubscriptionGuard feature="shift management">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shifts</h1>
          <p className="text-muted-foreground">
            Manage shifts and schedules for {currentLocation?.name || "this location"}
          </p>
        </div>

        <div className="rounded-lg border bg-card p-8 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Shift Management</h3>
            <p className="text-muted-foreground">
              Shift scheduling features coming soon...
            </p>
          </div>
        </div>
      </div>
    </SubscriptionGuard>
  );
}
