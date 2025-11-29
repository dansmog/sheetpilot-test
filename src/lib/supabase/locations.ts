import { createClient } from "@/utils/supabase/server";
import { LocationProps } from "@/utils/types";

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
