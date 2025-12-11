"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import {
  addLocationSchema,
  type AddLocationFormData,
} from "@/utils/validation-schemas/location.schema";
import { useModal } from "@/contexts/ModalContext";
import { useCompanyContext } from "@/contexts/CompanyContext";
import { useCreateLocation } from "@/hooks/react-query/hooks/use-locations";

export function AddLocationModal() {
  const { openModal, closeModal } = useModal();
  const { currentCompany } = useCompanyContext();
  const { mutate: createLocation, isPending } = useCreateLocation();

  const form = useForm<AddLocationFormData>({
    resolver: zodResolver(addLocationSchema),
    defaultValues: {
      company_id: "",
      name: "",
      slug: "",
      description: "",
      address: "",
      timezone: "",
      is_active: true,
    },
  });

  // Update company_id when modal opens or company changes
  useEffect(() => {
    if (openModal === "addLocation" && currentCompany?.company.id) {
      form.setValue("company_id", currentCompany.company.id);
    }
  }, [openModal, currentCompany, form]);

  const onSubmit = (data: AddLocationFormData) => {
    console.log("Form submitted with data:", data);
    createLocation(data, {
      onSuccess: () => {
        toast.success("Location created successfully");
        form.reset();
        closeModal();
      },
      onError: (error: Error) => {
        console.error("Error creating location:", error);
        toast.error(error.message || "Failed to create location");
      },
    });
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeModal();
      form.reset();
    }
  };

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    form.setValue("slug", slug);
  };

  return (
    <Sheet open={openModal === "addLocation"} onOpenChange={handleOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add Location</SheetTitle>
          <SheetDescription>
            Create a new location for your company
          </SheetDescription>
        </SheetHeader>

        {currentCompany && (
          <div className="mt-4 mx-4 rounded-lg flex flex-col gap-1 border bg-muted/50 p-3">
            <p className="text-sm text-muted-foreground">
              You are creating a new location for{" "}
            </p>
            <span className="font-medium text-foreground">
              {currentCompany.company.name}
            </span>
          </div>
        )}

        <div className="px-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 mt-6"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Main Office"
                        disabled={isPending}
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          handleNameChange(e);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="main-office"
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      URL-friendly identifier (auto-generated from name)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field: { value, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Brief description of the location"
                        disabled={isPending}
                        {...fieldProps}
                        value={value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field: { value, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel>Address (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="123 Main St, City, State"
                        disabled={isPending}
                        {...fieldProps}
                        value={value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timezone"
                render={({ field: { value, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel>Timezone (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="America/New_York"
                        disabled={isPending}
                        {...fieldProps}
                        value={value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={isPending}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending} className="flex-1">
                  {isPending ? "Creating..." : "Create Location"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
