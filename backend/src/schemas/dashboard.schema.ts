import { z } from "zod";

export const periodQuerySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
  month: z.coerce.number().int().min(1).max(12).optional(),
});

export const yearQuerySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
});

export const categoryBreakdownQuerySchema = periodQuerySchema.extend({
  type: z.enum(["INCOME", "EXPENSE", "INVESTMENT"]).optional(),
});

export type PeriodQuery = z.infer<typeof periodQuerySchema>;
export type YearQuery = z.infer<typeof yearQuerySchema>;
export type CategoryBreakdownQuery = z.infer<typeof categoryBreakdownQuerySchema>;
