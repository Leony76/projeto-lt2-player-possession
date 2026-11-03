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
    .number()
    .min(0, "The min lumber bucks amount is $0.")
    .max(20_000_000, "The max lumber bucks amount is $20,000,000.")
    .int("Lumber Bucks must be a integer number."),
});

export type UsernameFormData = z.infer<typeof usernameSchema>;
export type LumberBucksFormData = z.infer<typeof lumberBucksSchema>;