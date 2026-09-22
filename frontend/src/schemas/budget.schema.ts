import { z } from "zod";
import type { Category } from "./category.schema";

export const createBudgetSchema = z
  .object({
    categoryId: z.string().min(1, "Choose a category"),
    limitType: z.enum(["FIXED", "PERCENTAGE"]),
    monthlyLimit: z.coerce.number().positive().optional(),
    percentage: z.coerce.number().min(0).max(100).optional(),
  })
  .refine((data) => (data.limitType === "FIXED" ? data.monthlyLimit !== undefined : true), {
    message: "Enter the monthly limit",
    path: ["monthlyLimit"],
  })
  .refine((data) => (data.limitType === "PERCENTAGE" ? data.percentage !== undefined : true), {
    message: "Enter the percentage",
    path: ["percentage"],
  });

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;

export interface UpdateBudgetInput {
  limitType?: "FIXED" | "PERCENTAGE";
  monthlyLimit?: number;
  percentage?: number;
}

export interface Budget {
  id: string;
  categoryId: string;
  category: Category;
  limitType: "FIXED" | "PERCENTAGE";
  monthlyLimit: string | null;
  percentage: string | null;
}

export interface BudgetProgress {
  id: string;
  category: Category;
  limitType: "FIXED" | "PERCENTAGE";
  limit: string;
  spent: string;
  percentUsed: string;
  status: "ok" | "warning" | "danger";
}
