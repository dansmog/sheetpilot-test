"use client";

import React, { createContext, useContext, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useLocations } from "@/hooks/react-query/hooks";
import { LocationProps } from "@/utils/types";
import { useCompanyContext } from "./CompanyContext";

interface LocationContextType {
  currentLocation: LocationProps | null;
  locations: LocationProps[];
  switchLocation: (location: LocationProps) => void;
  isLoading: boolean;
}

const LocationContext = createContext<LocationContextType | undefined>(
  undefined
);

export function LocationProvider({
  children,
  locationSlug,
}: {
  children: React.ReactNode;
  locationSlug?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentCompany } = useCompanyContext();

  const {
    data: locations = [],
    isLoading,
    error,
  } = useLocations(currentCompany?.company.id || "", {
    activeOnly: false,
  });

  console.log("LocationContext:", {
    locations,
    locationsLength: locations.length,
    isLoading,
    error,
    locationSlug,
    companyId: currentCompany?.company.id,
  });

  const currentLocation = useMemo(() => {
    if (!locationSlug || !locations.length) return null;
    return locations.find((loc) => loc.slug === locationSlug) || null;
  }, [locationSlug, locations]);

  const switchLocation = (location: LocationProps) => {
    if (pathname && currentCompany) {
      const pathParts = pathname.split("/");

      // Check if we're in a location-level route: /dashboard/{slug}/{locationSlug}/...
      if (
        pathParts.length >= 4 &&
        pathParts[1] === "dashboard" &&
        pathParts[2] === currentCompany.company.slug
      ) {
        // Replace the location slug (at index 3)
        pathParts[3] = location.slug;
        const newPath = pathParts.join("/");
        router.push(newPath);
      } else {
        router.push(
          `/dashboard/${currentCompany.company.slug}/${location.slug}/overview`
        );
      }
    }
  };

  return (
    <LocationContext.Provider
      value={{
        currentLocation,
        locations,
        switchLocation,
        isLoading,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocationContext() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error(
      "useLocationContext must be used within a LocationProvider"
    );
  }
  return context;
}
