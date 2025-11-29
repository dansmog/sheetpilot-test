"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  createCompanySchema,
  type CreateCompanyFormValues,
} from "@/utils/validation-schemas/company.schema";

export default function CreateCompanyPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<CreateCompanyFormValues>({
    resolver: zodResolver(createCompanySchema),
    defaultValues: {
      name: "",
      subdomain: "",
      companyEmail: "",
    },
  });

  // Auto-generate subdomain from company name
  const handleCompanyNameChange = (value: string) => {
    const currentSubdomain = form.getValues("subdomain");

    // Only auto-generate if subdomain is empty or hasn't been manually edited
    if (
      !currentSubdomain ||
      currentSubdomain === generateSubdomain(form.getValues("name"))
    ) {
      const generatedSubdomain = generateSubdomain(value);
      form.setValue("subdomain", generatedSubdomain);
    }
  };

  const generateSubdomain = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
  };

  async function onSubmit(data: CreateCompanyFormValues) {
    setIsLoading(true);
    try {
      const response = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create company");
      }

      const { company } = await response.json();
      console.log("Company created:", company);
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : "Failed to create company";
      alert(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="w-full">
      <div className="flex flex-col text-center w-full mb-10">
        <h1 className="text-center text-primary text-xl font-semibold mb-1">
          Hello Juwon, let&apos;s create company
        </h1>
        <p className="text-muted-foreground text-sm">
          Set up your organization to start managing shifts
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Acme Inc."
                    disabled={isLoading}
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      handleCompanyNameChange(e.target.value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="subdomain"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subdomain</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="acme"
                      disabled={isLoading}
                      className="pr-32"
                      {...field}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                      .sheetpilot.app
                    </div>
                  </div>
                </FormControl>
                <FormDescription>Your unique company URL</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="companyEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="billing@yourcompany.com"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  This email will be used for billing and checkout sessions. It
                  takes priority over your personal email.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              disabled={isLoading}
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create company"}
            </Button>
          </div>
        </form>
      </Form>
    </section>
  );
}
