"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { UpdateProfileDataProps, UserProfileProps } from "@/utils/types";

async function updateUserProfile(
  data: UpdateProfileDataProps
): Promise<UserProfileProps> {
  const response = await axios.patch("/api/user/profile", data);
  return response.data.profile;
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(["user-profile"], data);
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
  });
}
