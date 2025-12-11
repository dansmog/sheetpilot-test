"use client";

import { LocationProps, LocationsOptionsProps } from "@/utils/types";
import { AddLocationFormData } from "@/utils/validation-schemas/location.schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

async function createLocation(data: AddLocationFormData) {
  const response = await axios.post("/api/locations", data);
  return response.data;
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

export function useCreateLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createLocation,
    onSuccess: () => {
      // Invalidate all location queries
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
  });
}
