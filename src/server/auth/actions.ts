"use server";

import { Prisma } from "@prisma/client";

import { signUpSchema } from "@/lib/validators/auth";
import { hashPassword } from "@/server/auth/password";
import { prisma } from "@/server/db/prisma";

export type SignUpState = {
  success: boolean;
  message: string;
  fieldErrors?: Record<string, string[]>;
};

export const initialSignUpState: SignUpState = {
  success: false,
  message: "",
};

export async function signUpAction(
  _prevState: SignUpState,
  formData: FormData,
): Promise<SignUpState> {
  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
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
        message: "An account with this email already exists.",
      };
    }

    return {
      success: false,
      message: "Unexpected error. Please try again.",
    };
  }
}
