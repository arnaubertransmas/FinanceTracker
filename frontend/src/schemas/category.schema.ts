import { z } from "zod";

export const transactionTypeSchema = z.enum(["INCOME", "EXPENSE", "INVESTMENT"]);
export type TransactionType = z.infer<typeof transactionTypeSchema>;

export const createCategorySchema = z.object({
  nombre: z.string().min(1, "Required").max(60),
  tipo: transactionTypeSchema,
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid color"),
  icono: z.string().min(1),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export interface Category {
  id: string;
  userId: string;
  nombre: string;
  tipo: TransactionType;
  color: string;
  icono: string;
}
