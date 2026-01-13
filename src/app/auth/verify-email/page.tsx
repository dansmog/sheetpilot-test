"use client";

import { Suspense, useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import axios from "axios";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resendEmail, setResendEmail] = useState("");
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const handleVerification = async () => {
      // Check if we got a success indicator from callback route
      const verified = searchParams.get("verified");
      if (verified === "true") {
        setIsVerifying(false);

        try {
          // Get the current session
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (!session) {
            setErrorMessage("No active session found. Please try logging in.");
            return;
          }

          const fullName = session.user.user_metadata.full_name;

          // Update profile
          await axios.patch("/api/users", { full_name: fullName });

          toast.success("Email verified successfully");

          // Redirect to onboarding after a brief delay
          setTimeout(() => {
            router.push("/onboarding/company");
          }, 1500);
        } catch (error) {
          console.error("Profile update error:", error);
          setErrorMessage(
            "Email verified, but failed to update profile. Please try logging in."
          );
        }
        return;
      }

      // Check for error in URL
      const error = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");

      if (error || errorDescription) {
        const message = errorDescription
          ? decodeURIComponent(errorDescription.replace(/\+/g, " "))
          : "Verification failed. Please try again.";

        setErrorMessage(message);
        setIsVerifying(false);
        return;
      }

      // If no verified param and no error, user probably navigated here directly
      // Show waiting message
      setIsVerifying(false);
    };

    handleVerification();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail) return;

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: resendEmail,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
      },
    });

    if (error) {
      toast.error(error.message || "Failed to resend verification email.");
    } else {
      toast.success("Verification email resent. Please check your inbox.");
      setResendEmail("");
    }
  };

  if (errorMessage) {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="rounded-full bg-red-100 p-3">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-center text-primary text-xl font-semibold mb-1">
            Verification Failed
          </h2>
          <p className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded-full">
            {errorMessage}
          </p>
        </div>

        <div className="pt-6 mt-5">
          <h3 className="text-sm font-medium mb-2">Request new link</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Please confirm your email to receive a new verification link.
          </p>
          <form onSubmit={handleResendVerification} className="space-y-3">
            <input
              type="email"
              placeholder="name@example.com"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              value={resendEmail}
              onChange={(e) => setResendEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              className="w-full rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              Resend Verification Email
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (isVerifying) {
    return (
      <section className="w-full">
        <div className="flex flex-col justify-center items-center text-center w-full mb-10">
          <h1 className="text-center text-primary text-xl font-semibold mb-1 mt-4">
            Verifying your email address
          </h1>
          <div className="mt-5">
            <Spinner className="text-brand-2 size-8" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full">
      <div className="flex flex-col justify-center items-center text-center w-full mb-10">
        <h1 className="text-center text-primary text-xl font-semibold mb-1 mt-4">
          Check your email
        </h1>
        <p className="text-muted-foreground text-sm mt-2">
          We sent you a verification link. Please check your email to verify
          your account.
        </p>
      </div>
    </section>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <section className="w-full">
          <div className="flex flex-col justify-center items-center text-center w-full mb-10">
            <h1 className="text-center text-primary text-xl font-semibold mb-1 mt-4">
              Loading...
            </h1>
            <div className="mt-5">
              <Spinner className="text-brand-2 size-8" />
            </div>
          </div>
        </section>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
