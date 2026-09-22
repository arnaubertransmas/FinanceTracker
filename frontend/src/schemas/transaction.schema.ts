import { z } from "zod";
import { transactionTypeSchema, type Category } from "./category.schema";

export const recurrenceFrequencySchema = z.enum(["WEEKLY", "MONTHLY", "YEARLY"]);
export type RecurrenceFrequency = z.infer<typeof recurrenceFrequencySchema>;

export const createTransactionSchema = z
  .object({
    type: transactionTypeSchema,
    categoryId: z.string().min(1, "Choose a category"),
    amount: z.coerce.number({ message: "Invalid amount" }).positive("Amount must be greater than 0"),
    description: z.string().max(280).optional(),
    date: z.string().min(1),
    recurring: z.boolean().default(false),
    recurrenceFrequency: recurrenceFrequencySchema.optional(),
  })
  .refine((data) => !data.recurring || !!data.recurrenceFrequency, {
    message: "Choose a frequency",
    path: ["recurrenceFrequency"],
  });

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;

export interface UpdateTransactionInput {
  categoryId?: string;
  amount?: number;
  description?: string;
  date?: string;
}

export interface Transaction {
  id: string;
  type: z.infer<typeof transactionTypeSchema>;
  categoryId: string;
  category: Category;
  amount: string;
  description: string | null;
  date: string;
  recurring: boolean;
  recurrenceFrequency: RecurrenceFrequency | null;
  recurrenceActive: boolean;
  generatedFromId: string | null;
}

export interface TransactionListResult {
  items: Transaction[];
  total: number;
  page: number;
  pageSize: number;
}
