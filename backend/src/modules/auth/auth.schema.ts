import { z } from "zod";

export const authSchema = z.object({
  username: z.string().trim().min(3).max(50),
  password: z.string().min(8).max(128),
});

export type AuthDTO = z.infer<typeof authSchema>;