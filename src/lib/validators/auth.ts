import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address").trim().toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export const signUpSchema = signInSchema
  .extend({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
    confirmPassword: z.string().min(8, "Confirm password must be at least 8 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
