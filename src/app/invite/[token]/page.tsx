"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const acceptInvitationSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type AcceptInvitationFormData = z.infer<typeof acceptInvitationSchema>;

interface InvitationDetails {
  company_name: string;
  role: string;
  email: string;
}

export default function AcceptInvitationPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const router = useRouter();
  const [token, setToken] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invitationDetails, setInvitationDetails] =
    useState<InvitationDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<AcceptInvitationFormData>({
    resolver: zodResolver(acceptInvitationSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    params.then((resolvedParams) => {
      setToken(resolvedParams.token);
      verifyInvitation(resolvedParams.token);
    });
  }, [params]);

  const verifyInvitation = async (invitationToken: string) => {
    try {
      setIsLoading(true);
      const supabase = createClient();

      // Fetch invitation details
      const { data: invitation, error: invitationError } = await supabase
        .from("company_members")
        .select(
          `
          id,
          email,
          role,
          status,
          invitation_expires_at,
          companies!inner(name)
        `
        )
        .eq("invitation_token", invitationToken)
        .eq("status", "pending")
        .single();

      if (invitationError || !invitation) {
        setError("Invalid or expired invitation link");
        return;
      }

      // Check if invitation has expired
      const expiresAt = new Date(invitation.invitation_expires_at);
      if (expiresAt < new Date()) {
        setError("This invitation has expired");
        return;
      }

      // Set invitation details
      setInvitationDetails({
        company_name: (invitation.companies as any).name,
        role: invitation.role,
        email: invitation.email || "",
      });
    } catch (err) {
      console.error("Error verifying invitation:", err);
      setError("Failed to verify invitation");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: AcceptInvitationFormData) => {
    if (!invitationDetails) return;

    setIsSubmitting(true);
    try {
      const supabase = createClient();

      // Sign up the user with Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp(
        {
          email: invitationDetails.email,
          password: data.password,
          options: {
            data: {
              invitation_token: token,
            },
          },
        }
      );

      if (signUpError) {
        toast.error(signUpError.message);
        return;
      }

      if (!authData.user) {
        toast.error("Failed to create account");
        return;
      }

      // Accept the invitation via API (this will update employee_count)
      const response = await fetch("/api/invitations/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          userId: authData.user.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error accepting invitation:", errorData);
        toast.error(errorData.error || "Failed to activate membership");
        return;
      }

      toast.success("Account created successfully! Redirecting...");

      // Redirect to dashboard
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err) {
      console.error("Error accepting invitation:", err);
      toast.error("Failed to accept invitation");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verifying invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/")} className="w-full">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invitationDetails) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Accept Invitation</CardTitle>
          <CardDescription>
            You&apos;ve been invited to join{" "}
            <strong>{invitationDetails.company_name}</strong> as a{" "}
            <strong>{invitationDetails.role}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={invitationDetails.email}
                  disabled
                  className="bg-muted"
                />
              </div>

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Confirm your password"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Accept Invitation & Create Account"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
