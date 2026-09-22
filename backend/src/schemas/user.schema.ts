import { z } from "zod";

export const resetPasswordSchema = z.object({
  password: z.string().min(1, "Required"),
});
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
