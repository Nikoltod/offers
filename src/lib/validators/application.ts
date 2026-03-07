import { ApplicationStatus } from "@prisma/client";
import { z } from "zod";

const applicationStatusValues = Object.values(ApplicationStatus) as [
  ApplicationStatus,
  ...ApplicationStatus[],
];

const requiredDateSchema = z
  .string()
  .trim()
  .min(1, "Applied date is required")
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Applied date must be a valid date",
  })
  .transform((value) => new Date(value));

const optionalDateSchema = z
  .string()
  .trim()
  .optional()
  .refine((value) => !value || !Number.isNaN(Date.parse(value)), {
    message: "Next action date must be a valid date",
  })
  .transform((value) => (value ? new Date(value) : undefined));

export const createApplicationSchema = z.object({
  company: z.string().trim().min(1, "Company is required").max(200),
  role: z.string().trim().min(1, "Role is required").max(200),
  location: z.string().trim().min(1, "Location is required").max(200),
  salaryRange: z.string().trim().max(100).optional().transform((value) => value || undefined),
  jobUrl: z
    .string()
    .trim()
    .min(1, "Job URL is required")
    .refine((value) => URL.canParse(value), { message: "Job URL must be a valid URL" }),
  status: z.enum(applicationStatusValues),
  notes: z.string().trim().max(2000).optional().transform((value) => value || undefined),
  appliedDate: requiredDateSchema,
  nextActionDate: optionalDateSchema,
  tags: z.string().trim().max(200).optional().transform((value) => value || undefined),
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
