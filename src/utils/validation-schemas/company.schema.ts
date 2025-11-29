import * as z from "zod";

// Subdomain validation: lowercase alphanumeric and hyphens only
const subdomainRegex = /^[a-z0-9-]+$/;

export const createCompanySchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Company name must be at least 2 characters.",
    })
    .max(100, {
      message: "Company name must not exceed 100 characters.",
    }),
  subdomain: z
    .string()
    .min(3, {
      message: "Subdomain must be at least 3 characters.",
    })
    .max(63, {
      message: "Subdomain must not exceed 63 characters.",
    })
    .regex(subdomainRegex, {
      message: "Subdomain can only contain lowercase letters, numbers, and hyphens.",
    })
    .refine((value) => !value.startsWith("-") && !value.endsWith("-"), {
      message: "Subdomain cannot start or end with a hyphen.",
    }),
  companyEmail: z
    .string()
    .email({
      message: "Please enter a valid email address.",
    })
    .optional()
    .or(z.literal("")),
});

export type CreateCompanyFormValues = z.infer<typeof createCompanySchema>;
