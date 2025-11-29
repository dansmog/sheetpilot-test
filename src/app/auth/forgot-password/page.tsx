"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/utils/validation-schemas/auth.schema";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(data: ForgotPasswordFormValues) {
    setIsLoading(true);
    try {
      // TODO: Implement forgot password logic
      console.log(data);
      // Add your login API call here
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="w-full">
      <div className="flex flex-col text-center w-full mb-10">
        <h1 className="text-center text-primary text-xl font-semibold mb-1">
          Forgot your password?
        </h1>
        <p className="text-muted-foreground text-sm">
          No worries, we&apos;ll send you reset instructions
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    autoComplete="email"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </Form>

      <p className="text-center text-sm text-muted-foreground my-6">
        Remember your password?{" "}
        <Link
          href="/auth/login"
          className="text-primary font-medium hover:underline inline-flex items-center gap-1"
        >
          Log in
          <span className="inline-block">→</span>
        </Link>
      </p>
    </section>
  );
}
