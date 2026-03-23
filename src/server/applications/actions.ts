"use server";

import { ApplicationStatus, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  CreateApplicationInput,
  createApplicationSchema,
  deleteApplicationSchema,
  trackDemoJobPostingSchema,
} from "@/lib/validators/application";
import {
  getTrackedApplicationForPosting,
} from "@/server/applications/queries";
import { requireUserSession } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";
import { getDemoJobPostingBySlug } from "@/server/job-postings/catalog";

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
    const tagNames = parsed.data.tags;

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

export async function trackDemoJobPostingAction(formData: FormData) {
  const session = await requireUserSession();

  const parsed = trackDemoJobPostingSchema.safeParse({
    slug: formData.get("slug"),
  });

  if (!parsed.success) {
    redirect("/dashboard");
  }

  const posting = getDemoJobPostingBySlug(parsed.data.slug);

  if (!posting) {
    redirect("/dashboard");
  }

  const existingApplication = await getTrackedApplicationForPosting(session.user.id, posting);

  if (existingApplication) {
    redirect(`/dashboard/${existingApplication.id}`);
  }

  const application = await prisma.$transaction(async (transaction) => {
    const createdApplication = await transaction.application.create({
      data: {
        userId: session.user.id,
        company: posting.company,
        role: posting.role,
        location: posting.location,
        salaryRange: posting.salaryRange,
        jobUrl: posting.jobUrl,
        status: posting.status,
        notes: posting.summary,
        appliedDate: new Date(posting.appliedDate),
        nextActionDate: posting.nextActionDate ? new Date(posting.nextActionDate) : undefined,
      },
      select: { id: true },
    });

    if (posting.tags.length > 0) {
      await transaction.tag.createMany({
        data: posting.tags.map((name) => ({
          userId: session.user.id,
          name,
        })),
        skipDuplicates: true,
      });

      const tags = await transaction.tag.findMany({
        where: {
          userId: session.user.id,
          name: { in: posting.tags },
        },
        select: { id: true },
      });

      if (tags.length > 0) {
        await transaction.applicationTag.createMany({
          data: tags.map((tag) => ({
            applicationId: createdApplication.id,
            tagId: tag.id,
          })),
          skipDuplicates: true,
        });
      }
    }

    return createdApplication;
  });

  revalidatePath("/dashboard");
  redirect(`/dashboard/${application.id}`);
}

export async function untrackDemoJobPostingAction(formData: FormData) {
  const session = await requireUserSession();

  const parsed = trackDemoJobPostingSchema.safeParse({
    slug: formData.get("slug"),
  });

  if (!parsed.success) {
    redirect("/dashboard");
  }

  const posting = getDemoJobPostingBySlug(parsed.data.slug);

  if (!posting) {
    redirect("/dashboard");
  }

  const existingApplication = await getTrackedApplicationForPosting(session.user.id, posting);

  if (!existingApplication) {
    redirect(`/dashboard/postings/${posting.slug}`);
  }

  await prisma.application.delete({
    where: { id: existingApplication.id },
  });

  revalidatePath("/dashboard");
  redirect(`/dashboard/postings/${posting.slug}`);
}

export async function deleteApplicationAction(formData: FormData) {
  const session = await requireUserSession();

  const parsed = deleteApplicationSchema.safeParse({
    applicationId: formData.get("applicationId"),
  });

  if (!parsed.success) {
    redirect("/dashboard");
  }

  await prisma.application.deleteMany({
    where: {
      id: parsed.data.applicationId,
      userId: session.user.id,
    },
  });

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
