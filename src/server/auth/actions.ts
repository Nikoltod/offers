"use server";

import { Prisma } from "@prisma/client";

import { SignUpInput, signUpSchema } from "@/lib/validators/auth";
import { hashPassword } from "@/server/auth/password";
import { enforceRateLimit } from "@/server/auth/rate-limit";
import { prisma } from "@/server/db/prisma";

const SIGN_UP_WINDOW_MS = 15 * 60 * 1000;
const SIGN_UP_MAX_ATTEMPTS = 5;

type SignUpFieldErrors = Partial<Record<keyof SignUpInput, string[]>>;

export type SignUpState = {
  success: boolean;
  message: string;
  fieldErrors?: SignUpFieldErrors;
};

export async function signUpAction(
  _prevState: SignUpState,
  formData: FormData,
): Promise<SignUpState> {
  const email = formData.get("email");

  if (typeof email === "string" && email) {
    const rateLimit = await enforceRateLimit({
      action: "sign-up",
      identifier: email,
      maxAttempts: SIGN_UP_MAX_ATTEMPTS,
      windowMs: SIGN_UP_WINDOW_MS,
    });

    if (!rateLimit.allowed) {
      return {
        success: false,
        message: "Too many attempts. Please try again later.",
      };
    }
  }

  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email,
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const passwordHash = await hashPassword(parsed.data.password);

    await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash,
      },
    });

    return {
      success: true,
      message: "Account created. You can now sign in.",
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return {
        success: false,
        message: "Could not create account. Please try again.",
      };
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError ||
      error instanceof Prisma.PrismaClientInitializationError
    ) {
      return {
        success: false,
        message: "Database is currently unavailable. Use demo login: admin@local.dev / 123",
      };
    }

    return {
      success: false,
      message: "Unexpected error. Please try again.",
    };
  }
}
