import { supabaseAdmin } from "./client";
import { Subscription } from "../subscriptions/queries";

export async function upsertSubscriptionAdmin(
    subscriptionData: Partial<Subscription>
): Promise<void> {
    const { error } = await supabaseAdmin.from("subscriptions").upsert(
        subscriptionData,
        {
            onConflict: "stripe_subscription_id",
            ignoreDuplicates: false,
        }
    );

    if (error) throw error;
}

export async function updateSubscriptionByStripeIdAdmin(
    stripeSubscriptionId: string,
    updates: Partial<Subscription>
): Promise<void> {
    const { error } = await supabaseAdmin
        .from("subscriptions")
        .update(updates)
        .eq("stripe_subscription_id", stripeSubscriptionId);

    if (error) throw error;
}
