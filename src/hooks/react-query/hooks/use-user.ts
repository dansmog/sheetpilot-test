"use client";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { RegisterFormValues } from "@/utils/validation-schemas/auth.schema";
import {
  LoginProps,
  UpdateProfileDataProps,
  UserProfileProps,
} from "@/utils/types";
import { toast } from "sonner";

// Types
interface RegisterResponse {
  message: string;
  user: {
    id: string;
    email: string;
  };
}

// API Functions
async function fetchUserProfile(): Promise<UserProfileProps> {
  const { data } = await axios.get("/api/users");
  return data.profile;
}

async function registerUser(
  data: RegisterFormValues
): Promise<RegisterResponse> {
  const response = await axios.post("/api/auth/register", data);
  return response.data;
}

async function updateUserProfile(
  data: UpdateProfileDataProps
): Promise<UserProfileProps> {
  const response = await axios.patch("/api/users", data);
  return response.data.profile;
}

export function useUserProfile(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["user-profile"],
    queryFn: fetchUserProfile,
    ...options,
  });
}

export function useRegisterUser() {
  return useMutation({
    mutationFn: registerUser,
  });
}

export function useUpdateUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(["user-profile"], data);
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
  });
}

export function useLoginUser() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (credentials: LoginProps) => {
      const response = await axios.post("/api/auth/login", credentials);
      return response.data;
    },
    onSuccess: async (data) => {
      toast.success("Login successful!");

      // Prefetch user profile
      await queryClient.prefetchQuery({
        queryKey: ["user-profile"],
        queryFn: async () => {
          const response = await axios.get("/api/users");
          return response.data.profile;
        },
      });

      // Prefetch user companies for the context
      await queryClient.prefetchQuery({
        queryKey: ["user-companies"],
        queryFn: async () => {
          const profileResponse = await axios.get("/api/users");
          const userId = profileResponse.data.profile.id;
          const response = await axios.get(`/api/companies?userId=${userId}`);
          return response.data.companies;
        },
      });

      router.push(data?.redirectUrl || "/dashboard/organizations");
    },
    onError: (error: AxiosError<{ error: string }>) => {
      console.log({ error });
      toast.error(
        error?.response?.data?.error || "Login failed. Please try again."
      );
    },
  });
}

export function useLogoutUser() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      const response = await axios.post("/api/auth/logout");
      return response.data;
    },
    onSuccess: () => {
      // Clear all TanStack Query cache
      queryClient.clear();

      toast.success("Logged out successfully!");
      router.push("/auth/login");
    },
    onError: (error: AxiosError<{ error: string }>) => {
      console.error("Logout error:", error);
      toast.error(
        error?.response?.data?.error || "Logout failed. Please try again."
      );
    },
  });
}
