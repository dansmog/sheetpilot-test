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
  addCompanyMemberSchema,
  type AddCompanyMemberFormData,
} from "@/utils/validation-schemas/company-member.schema";
import { useModal } from "@/contexts/ModalContext";
import { useCompanyContext } from "@/contexts/CompanyContext";
import { useAddCompanyMember } from "@/hooks/react-query/hooks/use-company-members";

export function AddEmployeeModal() {
  const { openModal, closeModal } = useModal();
  const { currentCompany } = useCompanyContext();
  const { mutate: addCompanyMember, isPending } = useAddCompanyMember();

  const form = useForm<AddCompanyMemberFormData>({
    resolver: zodResolver(addCompanyMemberSchema),
    defaultValues: {
      company_id: "",
      user_id: "",
      role: "member",
      status: "pending",
    },
  });

  // Update company_id when modal opens or company changes
  useEffect(() => {
    if (openModal === "addEmployee" && currentCompany?.company.id) {
      form.setValue("company_id", currentCompany.company.id);
    }
  }, [openModal, currentCompany, form]);

  const onSubmit = (data: AddCompanyMemberFormData) => {
    console.log("Form submitted with data:", data);
    addCompanyMember(data, {
      onSuccess: () => {
        toast.success("Employee added successfully");
        form.reset();
        closeModal();
      },
      onError: (error: Error) => {
        console.error("Error adding employee:", error);
        toast.error(error.message || "Failed to add employee");
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
    <Sheet open={openModal === "addEmployee"} onOpenChange={handleOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add Employee</SheetTitle>
          <SheetDescription>
            Add a new employee to your company
          </SheetDescription>
        </SheetHeader>

        {currentCompany && (
          <div className="mt-4 mx-4 rounded-lg flex flex-col gap-1 border bg-muted/50 p-3">
            <p className="text-sm text-muted-foreground">
              You are adding a new employee to{" "}
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
                name="user_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User ID</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter user ID"
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The unique identifier of the user to add as an employee
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="owner">Owner</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The role this employee will have in the company
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field: { value, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={fieldProps.onChange}
                      defaultValue={value}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The current status of this employee
                    </FormDescription>
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
                  {isPending ? "Adding..." : "Add Employee"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
