import { createClient } from "@/utils/supabase/server";
import { RegisterProps, UserProfileProps } from "@/utils/types";
import type { User } from "@supabase/supabase-js";

// User Registration and Auth
export async function registerUser({
  email,
  password,
  fullName,
}: RegisterProps): Promise<{ user: User | null; error: Error | null }> {
  const supabase = await createClient();

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (authError || !authData.user) {
    return { user: null, error: authError };
  }

  try {
    await updateUserProfile(authData.user.id, { full_name: fullName });
  } catch (updateError) {
    return { user: null, error: updateError as Error };
  }

  return { user: authData.user, error: null };
}

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
