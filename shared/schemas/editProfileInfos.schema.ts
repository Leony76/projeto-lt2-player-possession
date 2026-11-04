import { z } from "zod";

export const usernameSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must have at least 3 characters.")
    .max(20, "Username must have at most 20 characters.")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers and underscores."
    ),
});

export const lumberBucksSchema = z.object({
  lumberBucks: z
    .number({ error: "Lumber Bucks must be a valid number." })
    .min(0, "The min lumber bucks amount is $0.")
    .max(20_000_000, "The max lumber bucks amount is $20,000,000.")
    .int("Lumber Bucks must be a integer number."),
});

export const passwordSchema = z.object({
  password: z
    .string()
    .min(1, "The password is required")
    .max(128, "The password exceeds the permitted limit."),
});

export const newPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, "The password must have at least 8 chracters")
    .max(128, "The password must have a maximum of 128 characters."),
});

export type UsernameFormData = z.infer<typeof usernameSchema>;
export type PasswordFormData = z.infer<typeof passwordSchema>;
export type NewPasswordFormData = z.infer<typeof newPasswordSchema>;
export type LumberBucksFormData = z.infer<typeof lumberBucksSchema>;