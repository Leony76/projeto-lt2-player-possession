
import { z } from "zod";

export const signInSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "The name must have at least 3 characters.")
    .max(20, "The name must have a maximum of 20 characters."),

  password: z
    .string()
    .min(1, "The password is required")
    .max(128, "The password exceeds the permitted limit."),
});



export const signUpSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, "The name must have at least 3 characters.")
      .max(20, "The name must have a maximum of 20 characters.")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Use only letters, numbers, and underscores for the name.",
      ),

    password: z
      .string()
      .min(8, "The password must have at least 8 chracters")
      .max(128, "The password must have a maximum of 128 characters."),

    confirmPassword: z
      .string()
      .min(1, "Confirm your password"),
  }).refine(
    (data) => data.password === data.confirmPassword,
    {
      message: "The passwords do not match.",
      path: ["confirmPassword"],
    },
  );

export type SignInFormData = z.infer<typeof signInSchema>;

export type SignUpFormData = z.infer<typeof signUpSchema>;
