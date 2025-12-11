"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useDebounce } from "@uidotdev/usehooks";

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
import {
  useCheckSlugAvailability,
  useCreateCompany,
} from "@/hooks/react-query/hooks/use-company";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { CircleCheck, CircleX } from "lucide-react";

export default function CreateCompanyPage() {
  const router = useRouter();
  const { mutate: createCompany, isPending } = useCreateCompany();

  const form = useForm<CreateCompanyFormValues>({
    resolver: zodResolver(createCompanySchema),
    defaultValues: {
      name: "",
      subdomain: "",
      companyEmail: "",
    },
  });
  const debouncedSlugTerm = useDebounce(form.watch("subdomain"), 300);

  const {
    data: slugData,
    isLoading: isCheckingSlug,
    error: slugError,
  } = useCheckSlugAvailability(debouncedSlugTerm);

  async function onSubmit(data: CreateCompanyFormValues) {
    createCompany(data, {
      onSuccess: (response) => {
        toast.success("Company created successfully");
        console.log("Company created:", response.company);
        router.push("/dashboard");
      },
      onError: (error) => {
        console.error(error);
        const message =
          error instanceof Error ? error.message : "Failed to create company";
        toast.error(message);
      },
    });
  }

  return (
    <section className="w-full">
      <div className="flex flex-col text-center w-full mb-10">
        <h1 className="text-center text-primary text-xl font-semibold mb-1">
          Now, let&apos;s create company
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
                    disabled={isPending}
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
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
                      disabled={isPending}
                      className="pr-32"
                      {...field}
                    />

                    {/* RIGHT SIDE CONTAINER */}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-sm text-muted-foreground">
                      <span>.sheetpilot.app</span>

                      {/* Spinner / icons */}
                      {field.value?.length > 1 && (
                        <>
                          {isCheckingSlug && <Spinner className="size-3" />}

                          {!isCheckingSlug && slugData?.available && (
                            <CircleCheck className="size-4 text-green-600" />
                          )}

                          {!isCheckingSlug &&
                            slugData &&
                            !slugData.available && (
                              <CircleX className="size-4 text-red-600" />
                            )}

                          {slugError && (
                            <CircleX className="size-4 text-red-600" />
                          )}
                        </>
                      )}
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
                    disabled={isPending}
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
              type="submit"
              className="flex-1"
              disabled={isPending || slugData?.available === false}
            >
              {isPending ? "Creating..." : "Create company"}
            </Button>
          </div>
        </form>
      </Form>
    </section>
  );
}
