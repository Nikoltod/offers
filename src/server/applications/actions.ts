"use server";

import { ApplicationStatus, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { CreateApplicationInput, createApplicationSchema } from "@/lib/validators/application";
import { requireUserSession } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";

type CreateApplicationFieldErrors = Partial<Record<keyof CreateApplicationInput, string[]>>;
type ValidationIssue = {
  path: PropertyKey[];
  message: string;
};

export type CreateApplicationState = {
  success: boolean;
  message: string;
  fieldErrors?: CreateApplicationFieldErrors;
};

function mapIssuesToFieldErrors(issues: ValidationIssue[]): CreateApplicationFieldErrors {
  return issues.reduce<CreateApplicationFieldErrors>((accumulator, issue) => {
    const field = issue.path[0];

    if (typeof field !== "string") {
      return accumulator;
    }

    const typedField = field as keyof CreateApplicationInput;
    const existing = accumulator[typedField] ?? [];
    accumulator[typedField] = [...existing, issue.message];

    return accumulator;
  }, {});
}

function normalizeTagNames(rawTags?: string): string[] {
  if (!rawTags) {
    return [];
  }

  const unique = new Set(
    rawTags
      .split(",")
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean),
  );

  return Array.from(unique).slice(0, 10);
}

export async function createApplicationAction(
  _prevState: CreateApplicationState,
  formData: FormData,
): Promise<CreateApplicationState> {
  const session = await requireUserSession();

  const parsed = createApplicationSchema.safeParse({
    company: formData.get("company"),
    role: formData.get("role"),
    location: formData.get("location"),
    salaryRange: formData.get("salaryRange") || undefined,
    jobUrl: formData.get("jobUrl"),
    status: formData.get("status") || ApplicationStatus.WISHLIST,
    notes: formData.get("notes") || undefined,
    appliedDate: formData.get("appliedDate"),
    nextActionDate: formData.get("nextActionDate") || undefined,
    tags: formData.get("tags") || undefined,
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Please fix the highlighted fields.",
      fieldErrors: mapIssuesToFieldErrors(parsed.error.issues),
    };
  }

  try {
    const tagNames = normalizeTagNames(parsed.data.tags);

    await prisma.$transaction(async (transaction) => {
      const application = await transaction.application.create({
        data: {
          userId: session.user.id,
          company: parsed.data.company,
          role: parsed.data.role,
          location: parsed.data.location,
          salaryRange: parsed.data.salaryRange,
          jobUrl: parsed.data.jobUrl,
          status: parsed.data.status,
          notes: parsed.data.notes,
          appliedDate: parsed.data.appliedDate,
          nextActionDate: parsed.data.nextActionDate,
        },
      });

      if (tagNames.length === 0) {
        return;
      }

      await transaction.tag.createMany({
        data: tagNames.map((name) => ({
          userId: session.user.id,
          name,
        })),
        skipDuplicates: true,
      });

      const tags = await transaction.tag.findMany({
        where: {
          userId: session.user.id,
          name: { in: tagNames },
        },
        select: { id: true },
      });

      if (tags.length === 0) {
        return;
      }

      await transaction.applicationTag.createMany({
        data: tags.map((tag) => ({
          applicationId: application.id,
          tagId: tag.id,
        })),
        skipDuplicates: true,
      });
    });

    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Application created successfully.",
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return {
        success: false,
        message: "Could not create application. Please try again.",
      };
    }

    return {
      success: false,
      message: "Unexpected error. Please try again.",
    };
  }
}
