"use client";

import { RecurrenceFrequency } from "@/schemas/transaction.schema";

const FREQUENCIES: { value: RecurrenceFrequency; label: string }[] = [
  { value: "WEEKLY", label: "Weekly" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "YEARLY", label: "Yearly" },
];

export function RecurrenceFields({
  recurring,
  frequency,
  onRecurringChange,
  onFrequencyChange,
}: {
  recurring: boolean;
  frequency: RecurrenceFrequency | undefined;
  onRecurringChange: (value: boolean) => void;
  onFrequencyChange: (value: RecurrenceFrequency) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="label cursor-pointer justify-start gap-2">
        <input
          type="checkbox"
          className="checkbox"
          checked={recurring}
          onChange={(e) => onRecurringChange(e.target.checked)}
        />
        <span>Repeat this transaction</span>
      </label>

      {recurring && (
        <select
          className="select w-full"
          value={frequency ?? ""}
          onChange={(e) => onFrequencyChange(e.target.value as RecurrenceFrequency)}
        >
          <option value="" disabled>
            Frequency
          </option>
          {FREQUENCIES.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
