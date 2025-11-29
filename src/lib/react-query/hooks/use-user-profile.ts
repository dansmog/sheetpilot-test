"use client";

import { UserProfileProps } from "@/utils/types";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

async function fetchUserProfile(): Promise<UserProfileProps> {
  const { data } = await axios.get("/api/user/profile");
  return data.profile;
}

export function useUserProfile() {
  return useQuery({
    queryKey: ["user-profile"],
    queryFn: fetchUserProfile,
  });
}
