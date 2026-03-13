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

function isSupportedHttpUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

const normalizedTagsSchema = z
  .string()
  .trim()
  .max(200)
  .optional()
  .transform((value) => {
    if (!value) {
      return [] as string[];
    }

    const normalized = value
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean);

    return Array.from(new Set(normalized));
  })
  .refine((tags) => tags.length <= 10, {
    message: "At most 10 tags are allowed",
  })
  .refine((tags) => tags.every((tag) => tag.length <= 30), {
    message: "Each tag must be at most 30 characters",
  });

export const createApplicationSchema = z
  .object({
    company: z.string().trim().min(1, "Company is required").max(200),
    role: z.string().trim().min(1, "Role is required").max(200),
    location: z.string().trim().min(1, "Location is required").max(200),
    salaryRange: z.string().trim().max(100).optional().transform((value) => value || undefined),
    jobUrl: z
      .string()
      .trim()
      .min(1, "Job URL is required")
      .refine((value) => isSupportedHttpUrl(value), {
        message: "Job URL must be a valid HTTP or HTTPS URL",
      }),
    status: z.enum(applicationStatusValues),
    notes: z.string().trim().max(2000).optional().transform((value) => value || undefined),
    appliedDate: requiredDateSchema,
    nextActionDate: optionalDateSchema,
    tags: normalizedTagsSchema,
  })
  .superRefine((data, context) => {
    if (data.nextActionDate && data.nextActionDate < data.appliedDate) {
      context.addIssue({
        code: "custom",
        path: ["nextActionDate"],
        message: "Next action date cannot be earlier than applied date",
      });
    }
  });

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
