import { z } from "zod";

export const addLocationSchema = z.object({
  company_id: z.string().min(1, "Company ID is required"),
  name: z.string().min(1, "Location name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  description: z.string().optional(),
  address: z.string().optional(),
  timezone: z.string().optional(),
  is_active: z.boolean(),
});

export type AddLocationFormData = z.infer<typeof addLocationSchema>;
