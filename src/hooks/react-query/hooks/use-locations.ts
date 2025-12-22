"use client";

import { LocationProps, LocationsOptionsProps } from "@/utils/types";
import { AddLocationFormData } from "@/utils/validation-schemas/location.schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

async function fetchLocations(
  companyId: string,
  options: LocationsOptionsProps = {}
): Promise<LocationProps[]> {
  const params = new URLSearchParams();
  if (options.activeOnly) {
    params.append("activeOnly", "true");
  }

  const queryString = params.toString();
  const url = queryString
    ? `/api/companies/${companyId}/locations?${queryString}`
    : `/api/companies/${companyId}/locations`;

  const { data } = await axios.get(url);
  return data.locations;
}

async function createLocation(data: AddLocationFormData) {
  const { company_id, ...locationData } = data;
  const response = await axios.post(`/api/companies/${company_id}/locations`, locationData);
  return response.data;
}

async function deleteLocation(companyId: string, locationId: string) {
  const response = await axios.delete(`/api/companies/${companyId}/locations/${locationId}`);
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

export function useDeleteLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ companyId, locationId }: { companyId: string; locationId: string }) =>
      deleteLocation(companyId, locationId),
    onSuccess: () => {
      // Invalidate all location queries
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
  });
}
