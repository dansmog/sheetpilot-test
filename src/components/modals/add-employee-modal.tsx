"use client";

import { useEffect } from "react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  inviteEmployeeSchema,
  type InviteEmployeeFormData,
} from "@/utils/validation-schemas/employee-invitation.schema";
import { useModal } from "@/contexts/ModalContext";
import { useCompanyContext } from "@/contexts/CompanyContext";
import { useLocations } from "@/hooks/react-query/hooks/use-locations";
import { useInviteEmployee } from "@/hooks/react-query/hooks/use-company-members";

export function AddEmployeeModal() {
  const { openModal, closeModal } = useModal();
  const { currentCompany } = useCompanyContext();
  const { data: locations = [] } = useLocations(
    currentCompany?.company.id || "",
    { activeOnly: true }
  );

  const inviteEmployeeMutation = useInviteEmployee();

  const form = useForm<InviteEmployeeFormData>({
    resolver: zodResolver(inviteEmployeeSchema),
    defaultValues: {
      company_id: "",
      email: "",
      role: "employee",
      primary_location_id: null,
    },
  });

  // Update company_id when modal opens or company changes
  useEffect(() => {
    if (openModal === "addEmployee" && currentCompany?.company.id) {
      form.setValue("company_id", currentCompany.company.id);
    }
  }, [openModal, currentCompany, form]);

  const onSubmit = async (data: InviteEmployeeFormData) => {
    console.log("Form submitted with data:", data);

    inviteEmployeeMutation.mutate(data, {
      onSuccess: () => {
        toast.success("Invitation sent successfully");
        form.reset();
        closeModal();
      },
      onError: (error) => {
        console.error("Error sending invitation:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to send invitation"
        );
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
    <Dialog open={openModal === "addEmployee"} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Invite Employee</DialogTitle>
          <DialogDescription>
            Send an invitation to a new employee via email
          </DialogDescription>
        </DialogHeader>

        {currentCompany && (
          <div className="rounded-lg flex flex-col gap-1 border bg-muted/50 p-3">
            <p className="text-sm text-muted-foreground">
              Inviting employee to{" "}
            </p>
            <span className="font-medium text-foreground">
              {currentCompany.company.name}
            </span>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="employee@example.com"
                      disabled={inviteEmployeeMutation.isPending}
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4 w-full">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="">
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={inviteEmployeeMutation.isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="employee">Employee</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="owner">Owner</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="primary_location_id"
                render={({ field }) => (
                  <FormItem className="">
                    <FormLabel>Primary Location</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value || undefined}
                      disabled={inviteEmployeeMutation.isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a location (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No location</SelectItem>
                        {locations.map((location) => (
                          <SelectItem key={location.id} value={location.id}>
                            {location.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="mt-10">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={inviteEmployeeMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={inviteEmployeeMutation.isPending}>
                {inviteEmployeeMutation.isPending
                  ? "Sending Invitation..."
                  : "Send Invitation"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
