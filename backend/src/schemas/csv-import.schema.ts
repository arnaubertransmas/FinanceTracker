import { isValid, parseISO } from "date-fns";
import { z } from "zod";
import { transactionTypeSchema } from "./category.schema";

const csvTypeSchema = z.preprocess(
  (v) => (typeof v === "string" ? v.trim().toUpperCase() : v),
  transactionTypeSchema
);

const dateOnly = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)")
  .refine((value) => isValid(parseISO(value)), "This date does not exist");

const optionalTrimmed = z
  .string()
  .transform((v) => v.trim())
  .optional()
  .transform((v) => (v ? v : undefined));

export const csvRowSchema = z.object({
  date: dateOnly,
  type: csvTypeSchema,
  category: z.string().trim().min(1, "Category is required"),
  amount: z.coerce.number({ message: "Invalid amount" }).positive("Amount must be greater than 0"),
  description: optionalTrimmed,
});

export type CsvRow = z.infer<typeof csvRowSchema>;

export const confirmImportSchema = z.object({
  rows: z.array(csvRowSchema).min(1, "No rows to import"),
});

export type ConfirmImportInput = z.infer<typeof confirmImportSchema>;
