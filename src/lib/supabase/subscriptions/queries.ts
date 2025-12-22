import { createClient } from "@/utils/supabase/server";

export interface Subscription {
    id: string;
    company_id: string;
    stripe_subscription_id: string;
    stripe_price_id: string;
    status: string;
    plan_name: string;
    type: string;
    is_active: boolean;
    billing_interval?: string;
    current_period_start: string;
    current_period_end: string;
    cancel_at_period_end: boolean;
    stripe_item_id_location?: string | null;
    stripe_item_id_employee?: string | null;
    updated_at: string;
}

export async function updateSubscription(
    subscriptionId: string,
    updates: Partial<Subscription>
): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
        .from("subscriptions")
        .update(updates)
        .eq("id", subscriptionId);

    if (error) throw error;
}

export async function upsertSubscription(
    subscriptionData: Partial<Subscription>
): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase.from("subscriptions").upsert(
        subscriptionData,
        {
            onConflict: "stripe_subscription_id",
            ignoreDuplicates: false,
        }
    );

    if (error) throw error;
}

export async function updateSubscriptionByStripeId(
    stripeSubscriptionId: string,
    updates: Partial<Subscription>
): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
        .from("subscriptions")
        .update(updates)
        .eq("stripe_subscription_id", stripeSubscriptionId);

    if (error) throw error;
}

export async function getActiveSubscription(
    companyId: string
): Promise<Subscription | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("company_id", companyId)
        .eq("is_active", true)
        .eq("type", "base")
        .single();

    if (error) {
        if (error.code === "PGRST116") return null;
        throw error;
    }

    return data;
}
