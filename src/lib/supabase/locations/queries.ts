import { createClient } from "@/utils/supabase/server";
import { LocationProps } from "@/utils/types";
import { updateCompany } from "@/lib/supabase/companies/queries";

export async function getLocations(
  companyId: string,
  activeOnly: boolean = false
): Promise<LocationProps[]> {
  const supabase = await createClient();

  let query = supabase
    .from("locations")
    .select("*")
    .eq("company_id", companyId)
    .order("display_order", { ascending: true });

  if (activeOnly) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data || [];
}

export interface CreateLocationData {
  company_id: string;
  name: string;
  slug: string;
  description?: string | null;
  address?: string | null;
  timezone?: string;
  is_active?: boolean;
  created_by?: string;
}

export async function createLocation(
  locationData: CreateLocationData
): Promise<LocationProps> {
  const supabase = await createClient();

  // Get the max display_order for this company
  const { data: maxOrderData } = await supabase
    .from("locations")
    .select("display_order")
    .eq("company_id", locationData.company_id)
    .order("display_order", { ascending: false })
    .limit(1);

  const nextDisplayOrder = maxOrderData?.[0]?.display_order
    ? maxOrderData[0].display_order + 1
    : 0;

  const { data: location, error } = await supabase
    .from("locations")
    .insert({
      ...locationData,
      display_order: nextDisplayOrder,
    })
    .select()
    .single();

  if (error) throw error;

  // Get current location_count to increment it
  const { data: company } = await supabase
    .from("companies")
    .select("location_count")
    .eq("id", locationData.company_id)
    .single();

  const currentCount = company?.location_count || 0;

  // Increment location_count in companies table
  try {
    await updateCompany(locationData.company_id, {
      location_count: currentCount + 1,
    });
  } catch (updateError) {
    console.error("Failed to increment location_count:", updateError);
    // Don't throw - location was created successfully
  }

  return location;
}
