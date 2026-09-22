import { addMonths, addWeeks, addYears } from "date-fns";
import { RecurrenceFrequency } from "@prisma/client";

export function parseDateOnly(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

export function toDateOnlyString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function todayDateOnly(): Date {
  return parseDateOnly(toDateOnlyString(new Date()));
}

export function monthRange(month: number, year: number) {
  const from = new Date(Date.UTC(year, month - 1, 1));
  const to = new Date(Date.UTC(year, month, 1));
  return { from, to };
}

export function yearRange(year: number) {
  const from = new Date(Date.UTC(year, 0, 1));
  const to = new Date(Date.UTC(year + 1, 0, 1));
  return { from, to };
}

export function periodRange(year: number, month?: number) {
  return month ? monthRange(month, year) : yearRange(year);
}

export function addRecurrencePeriod(date: Date, frequency: RecurrenceFrequency): Date {
  switch (frequency) {
    case "WEEKLY":
      return addWeeks(date, 1);
    case "MONTHLY":
      return addMonths(date, 1);
    case "YEARLY":
      return addYears(date, 1);
  }
}
