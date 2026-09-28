"use client";

import { RecurrenceFrequency } from "@/schemas/transaction.schema";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { TranslationKey } from "@/lib/i18n/translations";

const FREQUENCIES: { value: RecurrenceFrequency; labelKey: TranslationKey }[] = [
  { value: "WEEKLY", labelKey: "transactions.weekly" },
  { value: "MONTHLY", labelKey: "transactions.monthly" },
  { value: "YEARLY", labelKey: "transactions.yearly" },
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
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-2">
      <label className="label cursor-pointer justify-start gap-2">
        <input
          type="checkbox"
          className="checkbox"
          checked={recurring}
          onChange={(e) => onRecurringChange(e.target.checked)}
        />
        <span>{t("transactions.repeatThisTransaction")}</span>
      </label>

      {recurring && (
        <select
          className="select w-full"
          value={frequency ?? ""}
          onChange={(e) => onFrequencyChange(e.target.value as RecurrenceFrequency)}
        >
          <option value="" disabled>
            {t("transactions.frequency")}
          </option>
          {FREQUENCIES.map((f) => (
            <option key={f.value} value={f.value}>
              {t(f.labelKey)}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
