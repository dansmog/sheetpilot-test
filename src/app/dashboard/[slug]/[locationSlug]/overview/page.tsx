"use client";

import { useParams } from "next/navigation";
import { useLocationContext } from "@/contexts/LocationContext";
import { useCompanyContext } from "@/contexts/CompanyContext";

export default function LocationOverviewPage() {
  const params = useParams();
  const locationSlug = params.locationSlug as string;
  const { currentLocation } = useLocationContext();
  const { currentCompany } = useCompanyContext();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">
          {currentLocation?.name || "Location Overview"}
        </h1>
        <p className="text-muted-foreground">
          {currentLocation?.address || "No address available"}
        </p>
      </div>
    </div>
  );
}
