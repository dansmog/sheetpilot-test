"use client";

import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/EmptyState";
import { useModal } from "@/contexts/ModalContext";
import { useCompanyContext } from "@/contexts/CompanyContext";
import { useLocations } from "@/hooks/react-query/hooks/use-locations";
import Link from "next/link";

export default function LocationPage() {
  const { setOpenModal } = useModal();
  const { currentCompany } = useCompanyContext();

  const { data: locations = [], isLoading } = useLocations(
    currentCompany?.company.id || "",
    {
      activeOnly: false,
    }
  );

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
      <EmptyState
        icon={Search}
        title="No locations found"
        description="You currently don't have any location yet."
        actionLabel="Add a new location"
        actionIcon={Plus}
        actionVariant="default"
        onAction={() => setOpenModal("addLocation")}
      />
    );
  }

  return (
    <section className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Locations</h1>
        <Button onClick={() => setOpenModal("addLocation")} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Location
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {locations.map((location) => (
          <Link
            href={`/dashboard/${currentCompany?.company.slug}/${location.slug}/overview`}
            key={location.id}
            className="p-4 border border-subtle rounded-lg"
          >
            <div className="flex flex-col">
              <h3 className="font-semibold text-base">{location.name}</h3>
              {location.address && (
                <p className="text-sm text-muted-foreground">
                  {location.address}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
