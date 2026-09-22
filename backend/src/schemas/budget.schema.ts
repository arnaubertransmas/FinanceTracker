import { z } from "zod";

export const createBudgetSchema = z
  .object({
    categoryId: z.string().uuid(),
    limitType: z.enum(["FIXED", "PERCENTAGE"]),
    monthlyLimit: z.coerce.number().positive().optional(),
    percentage: z.coerce.number().min(0).max(100).optional(),
  })
  .refine((data) => (data.limitType === "FIXED" ? data.monthlyLimit !== undefined : true), {
    message: "monthlyLimit is required when limitType is FIXED",
    path: ["monthlyLimit"],
  })
  .refine((data) => (data.limitType === "PERCENTAGE" ? data.percentage !== undefined : true), {
    message: "percentage is required when limitType is PERCENTAGE",
    path: ["percentage"],
  });

export const updateBudgetSchema = z.object({
  limitType: z.enum(["FIXED", "PERCENTAGE"]).optional(),
  monthlyLimit: z.coerce.number().positive().optional(),
  percentage: z.coerce.number().min(0).max(100).optional(),
});

export const budgetQuerySchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000).max(2100),
});

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;
export type BudgetQuery = z.infer<typeof budgetQuerySchema>;
