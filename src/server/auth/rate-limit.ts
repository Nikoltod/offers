import { Prisma } from "@prisma/client";

import { prisma } from "@/server/db/prisma";

type RateLimitInput = {
  action: "sign-in" | "sign-up";
  identifier: string;
  maxAttempts: number;
  windowMs: number;
};

type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds?: number;
};

function normalizeIdentifier(identifier: string) {
  return identifier.trim().toLowerCase();
}

export async function enforceRateLimit(input: RateLimitInput): Promise<RateLimitResult> {
  const normalizedIdentifier = normalizeIdentifier(input.identifier);
  if (!normalizedIdentifier) {
    return { allowed: true };
  }

  try {
    const now = new Date();

    const current = await prisma.authRateLimit.findUnique({
      where: {
        action_identifier: {
          action: input.action,
          identifier: normalizedIdentifier,
        },
      },
    });

    if (!current) {
      await prisma.authRateLimit.create({
        data: {
          action: input.action,
          identifier: normalizedIdentifier,
          hits: 1,
          windowStart: now,
        },
      });

      return { allowed: true };
    }

    const windowStartMs = current.windowStart.getTime();
    const nowMs = now.getTime();
    const elapsedMs = nowMs - windowStartMs;

    if (elapsedMs >= input.windowMs) {
      await prisma.authRateLimit.update({
        where: {
          action_identifier: {
            action: input.action,
            identifier: normalizedIdentifier,
          },
        },
        data: {
          hits: 1,
          windowStart: now,
        },
      });

      return { allowed: true };
    }

    if (current.hits >= input.maxAttempts) {
      return {
        allowed: false,
        retryAfterSeconds: Math.ceil((input.windowMs - elapsedMs) / 1000),
      };
    }

    await prisma.authRateLimit.update({
      where: {
        action_identifier: {
          action: input.action,
          identifier: normalizedIdentifier,
        },
      },
      data: {
        hits: {
          increment: 1,
        },
      },
    });

    return { allowed: true };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.warn("Rate-limit storage unavailable; allowing request", {
        action: input.action,
        code: error.code,
      });
      return { allowed: true };
    }

    throw error;
  }
}
