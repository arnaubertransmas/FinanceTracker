import { isValid, parseISO } from "date-fns";
import { z } from "zod";

const dateOnly = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD")
  .refine((value) => isValid(parseISO(value)), "Invalid date");

export const upsertSnapshotSchema = z.object({
  date: dateOnly,
  value: z.coerce.number().nonnegative(),
});

export type UpsertSnapshotInput = z.infer<typeof upsertSnapshotSchema>;

export const updateSnapshotSchema = z.object({
  date: dateOnly.optional(),
  value: z.coerce.number().nonnegative().optional(),
});

export type UpdateSnapshotInput = z.infer<typeof updateSnapshotSchema>;
