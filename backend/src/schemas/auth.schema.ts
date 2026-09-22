import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Required"),
  password: z.string().min(8),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const createUserSchema = z.object({
  email: z.string().min(1, "Required"),
  password: z.string().min(8),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
