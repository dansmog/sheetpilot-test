import { supabaseAdmin } from "./client";
import { CompanyProps } from "@/utils/types";

export async function updateCompanyAdmin(
    companyId: string,
    updates: Partial<CompanyProps>
): Promise<void> {
    const { error } = await supabaseAdmin
        .from("companies")
        .update(updates)
        .eq("id", companyId);

    if (error) throw error;
}

export async function updateCompanyByStripeCustomerIdAdmin(
    stripeCustomerId: string,
    updates: Partial<CompanyProps>
): Promise<void> {
    const { error } = await supabaseAdmin
        .from("companies")
        .update(updates)
        .eq("stripe_customer_id", stripeCustomerId);

    if (error) throw error;
}

export async function getCompanyByStripeCustomerIdAdmin(
    stripeCustomerId: string
): Promise<CompanyProps | null> {
    const { data, error } = await supabaseAdmin
        .from("companies")
        .select("*")
        .eq("stripe_customer_id", stripeCustomerId)
        .single();

    if (error) {
        if (error.code === "PGRST116") return null;
        throw error;
    }

    return data;
}
