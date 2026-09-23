import { z } from "zod";

export const resetPasswordSchema = z.object({
  password: z.string().min(1, "Required"),
});
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const roleSchema = z.enum(["USER", "ADMIN"]);

export const createUserSchema = z.object({
  email: z.string().min(1, "Required"),
  password: z.string().min(1, "Required"),
  role: roleSchema.optional(),
});
export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateRoleSchema = z.object({
  role: roleSchema,
});
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
