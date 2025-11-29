import { createClient } from "@/utils/supabase/server";
import { UserProfileProps } from "@/utils/types";

// User Profile Queries
export async function getUserProfile(
  userId: string
): Promise<UserProfileProps | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateUserProfile(
  userId: string,
  data: Partial<
    Omit<UserProfileProps, "id" | "email" | "created_at" | "updated_at">
  >
): Promise<UserProfileProps> {
  const supabase = await createClient();

  const { data: updatedProfile, error } = await supabase
    .from("users")
    .update(data)
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return updatedProfile;
}
