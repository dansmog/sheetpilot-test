"use client";

import { LocationProps, LocationsOptionsProps } from "@/utils/types";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

async function fetchLocations(
  companyId: string,
  options: LocationsOptionsProps = {}
): Promise<LocationProps[]> {
  const params = new URLSearchParams({ companyId });
  if (options.activeOnly) {
    params.append("activeOnly", "true");
  }

  const { data } = await axios.get(`/api/locations?${params.toString()}`);
  return data.locations;
}

export function useLocations(
  companyId: string,
  options: LocationsOptionsProps = {}
) {
  return useQuery({
    queryKey: ["locations", companyId, options],
    queryFn: () => fetchLocations(companyId, options),
    enabled: !!companyId,
  });
}
