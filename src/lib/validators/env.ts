import { z } from "zod";

const booleanFromEnv = z.preprocess((value) => {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["1", "true", "yes", "on"].includes(normalized)) {
      return true;
    }

    if (["0", "false", "no", "off"].includes(normalized)) {
      return false;
    }
  }

  return undefined;
}, z.boolean().default(false));

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  AUTH_SECRET: z.string().min(16, "AUTH_SECRET must be at least 16 characters"),
  ALLOW_DEMO_AUTH: booleanFromEnv,
  DEMO_AUTH_EMAIL: z.string().email().default("admin@local.dev"),
  DEMO_AUTH_PASSWORD: z.string().min(8).default("password123"),
  BOOTSTRAP_ADMIN_EMAIL: z.string().email().optional(),
  BOOTSTRAP_ADMIN_PASSWORD: z.string().min(12).optional(),
});

const safeEnvSchema = envSchema.superRefine((data, context) => {
  if (data.NODE_ENV === "production" && data.ALLOW_DEMO_AUTH) {
    context.addIssue({
      code: "custom",
      path: ["ALLOW_DEMO_AUTH"],
      message: "ALLOW_DEMO_AUTH must be disabled in production",
    });
  }

  const hasBootstrapEmail = typeof data.BOOTSTRAP_ADMIN_EMAIL === "string";
  const hasBootstrapPassword = typeof data.BOOTSTRAP_ADMIN_PASSWORD === "string";

  if (hasBootstrapEmail !== hasBootstrapPassword) {
    context.addIssue({
      code: "custom",
      path: ["BOOTSTRAP_ADMIN_EMAIL"],
      message:
        "BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD must both be set when bootstrapping",
    });
  }
});

const parsedEnv = safeEnvSchema.safeParse(process.env);

if (!parsedEnv.success) {
  throw new Error(`Invalid environment configuration: ${parsedEnv.error.message}`);
}

export const env = parsedEnv.data;
