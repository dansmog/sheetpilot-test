"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useDebounce } from "@uidotdev/usehooks";
import { CircleCheck, CircleX } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  createCompanySchema,
  type CreateCompanyFormValues,
} from "@/utils/validation-schemas/company.schema";
import { useModal } from "@/contexts/ModalContext";
import {
  useCheckSlugAvailability,
  useCreateCompany,
} from "@/hooks/react-query/hooks/use-company";

export function AddCompanyModal() {
  const { openModal, closeModal } = useModal();
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

  const onSubmit = (data: CreateCompanyFormValues) => {
    console.log("Form submitted with data:", data);
    createCompany(data, {
      onSuccess: () => {
        toast.success("Company created successfully");
        form.reset();
        closeModal();
      },
      onError: (error: Error) => {
        console.error("Error creating company:", error);
        toast.error(error.message || "Failed to create company");
      },
    });
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeModal();
      form.reset();
    }
  };

  return (
    <Dialog open={openModal === "addCompany"} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Company</DialogTitle>
          <DialogDescription>
            Set up your organization to start managing shifts
          </DialogDescription>
        </DialogHeader>

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
                    This email will be used for billing and checkout sessions.
                    It takes priority over your personal email.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending || slugData?.available === false}
              >
                {isPending ? "Creating..." : "Create Company"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
