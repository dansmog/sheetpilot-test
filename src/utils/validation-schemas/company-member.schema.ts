import { z } from "zod";

export const addCompanyMemberSchema = z.object({
  company_id: z.string().min(1, "Company ID is required"),
  user_id: z.string().min(1, "User ID is required"),
  role: z.enum(["owner", "admin", "member"], {
    errorMap: () => ({ message: "Role must be owner, admin, or member" }),
  }),
  status: z.enum(["active", "inactive", "pending"]).optional(),
});

export type AddCompanyMemberFormData = z.infer<typeof addCompanyMemberSchema>;
