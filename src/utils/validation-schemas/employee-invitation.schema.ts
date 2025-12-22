import { z } from "zod";

export const inviteEmployeeSchema = z.object({
  company_id: z.string().min(1, "Company ID is required"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["owner", "manager", "employee"], {
    message: "Role must be owner, manager, or employee",
  }),
  primary_location_id: z.string().nullable().optional(),
});

export type InviteEmployeeFormData = z.infer<typeof inviteEmployeeSchema>;
