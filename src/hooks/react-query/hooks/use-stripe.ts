"use client";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";

interface CreatePortalSessionProps {
  companyId: string;
  returnUrl?: string;
}

interface CreatePortalSessionResponse {
  url: string;
}

async function createPortalSession({
  companyId,
  returnUrl,
}: CreatePortalSessionProps): Promise<CreatePortalSessionResponse> {
  const response = await axios.post("/api/stripe/portal", {
    companyId,
    returnUrl,
  });
  return response.data;
}

export function useCreatePortalSession() {
  return useMutation({
    mutationFn: createPortalSession,
    onSuccess: (data) => {
      // Redirect to Stripe portal
      window.location.href = data.url;
    },
    onError: (error: AxiosError<{ error: string }>) => {
      console.error("Portal session error:", error);
      toast.error(
        error?.response?.data?.error || "Failed to open billing portal. Please try again."
      );
    },
  });
}
