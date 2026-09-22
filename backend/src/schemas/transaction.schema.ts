import { isValid, parseISO } from "date-fns";
import { z } from "zod";
import { transactionTypeSchema } from "./category.schema";

export const recurrenceFrequencySchema = z.enum(["WEEKLY", "MONTHLY", "YEARLY"]);

const dateOnly = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD")
  .refine((value) => isValid(parseISO(value)), "Invalid date");

export const createTransactionSchema = z
  .object({
    type: transactionTypeSchema,
    categoryId: z.string().uuid(),
    amount: z.coerce.number().positive(),
    description: z.string().max(280).optional(),
    date: dateOnly.optional(),
    recurring: z.boolean().optional().default(false),
    recurrenceFrequency: recurrenceFrequencySchema.optional(),
  })
  .refine((data) => !data.recurring || !!data.recurrenceFrequency, {
    message: "recurrenceFrequency is required when recurring is true",
    path: ["recurrenceFrequency"],
  });

export const updateTransactionSchema = z.object({
  categoryId: z.string().uuid().optional(),
  amount: z.coerce.number().positive().optional(),
  description: z.string().max(280).optional(),
  date: dateOnly.optional(),
  recurrenceActive: z.boolean().optional(),
});

export const listTransactionsQuerySchema = z.object({
  type: transactionTypeSchema.optional(),
  categoryId: z.string().uuid().optional(),
  from: dateOnly.optional(),
  to: dateOnly.optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(200).optional().default(50),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type ListTransactionsQuery = z.infer<typeof listTransactionsQuerySchema>;
