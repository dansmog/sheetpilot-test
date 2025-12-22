"use client";

import { useLocationContext } from "@/contexts/LocationContext";
import { SubscriptionGuard } from "@/components/guards/SubscriptionGuard";

export default function LocationSettingsPage() {
  const { currentLocation } = useLocationContext();

  return (
    <SubscriptionGuard feature="location settings">
      <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Configure settings for {currentLocation?.name || "this location"}
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-xl font-semibold mb-4">Location Information</h2>
        <div className="grid gap-4">
          <div>
            <label className="text-sm font-medium">Location Name</label>
            <input
              type="text"
              disabled
              value={currentLocation?.name || ""}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Address</label>
            <input
              type="text"
              disabled
              value={currentLocation?.address || ""}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Timezone</label>
            <input
              type="text"
              disabled
              value={currentLocation?.timezone || ""}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea
              disabled
              value={currentLocation?.description || ""}
              rows={3}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2"
            />
          </div>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Settings editing functionality coming soon...
        </p>
      </div>
      </div>
    </SubscriptionGuard>
  );
}
