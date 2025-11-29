import { createClient } from "@/utils/supabase/server";
import { CompanyProps } from "@/utils/types";

export async function getCompany(companyId: string): Promise<CompanyProps | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("id", companyId)
    .eq("is_active", true)
    .single();

  if (error) {
    throw error;
  }

  return data;
}
