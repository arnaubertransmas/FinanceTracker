import { z } from "zod";

export const transactionTypeSchema = z.enum(["INCOME", "EXPENSE", "INVESTMENT"]);

export const createCategorySchema = z.object({
  nombre: z.string().min(1).max(60),
  tipo: transactionTypeSchema,
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Color must be a hex value like #22c55e"),
  icono: z.string().min(1).max(40),
});

export const updateCategorySchema = createCategorySchema.partial();

export const findOrCreateCategorySchema = z.object({
  nombre: z.string().min(1).max(60),
  tipo: transactionTypeSchema,
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type FindOrCreateCategoryInput = z.infer<typeof findOrCreateCategorySchema>;
