"use client";

import { useTransactions } from "@/hooks/useTransactions";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { TranslationKey } from "@/lib/i18n/translations";

const FREQUENCY_KEY: Record<string, TranslationKey> = {
  WEEKLY: "transactions.weekly",
  MONTHLY: "transactions.monthly",
  YEARLY: "transactions.yearly",
};

const TYPE_AMOUNT_CLASS: Record<string, string> = {
  INCOME: "text-success",
  EXPENSE: "text-error",
  INVESTMENT: "text-info",
};

export function RecurringTransactionsCard() {
  const { t } = useLanguage();
  const { data, isLoading } = useTransactions({ recurring: true, page: 1 });
  const items = data?.items ?? [];

  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body">
        <h3 className="card-title text-base">{t("dashboard.recurringTitle")}</h3>
        {isLoading ? (
          <p className="opacity-60 text-sm">{t("common.loading")}</p>
        ) : items.length === 0 ? (
          <p className="opacity-60 text-sm">{t("dashboard.noRecurring")}</p>
        ) : (
          <ul className="flex flex-col divide-y divide-base-200">
            {items.map((tx) => (
              <li key={tx.id} className="flex items-center justify-between gap-2 py-2">
                <span className="flex items-center gap-3">
                  <CategoryIcon icono={tx.category.icono} color={tx.category.color} size="sm" />
                  <span className="flex flex-col">
                    <span className="font-medium">{tx.description || tx.category.nombre}</span>
                    <span className="text-xs opacity-60">
                      {tx.recurrenceFrequency ? t(FREQUENCY_KEY[tx.recurrenceFrequency]) : ""}
                    </span>
                  </span>
                </span>
                <span className={`text-base font-semibold ${TYPE_AMOUNT_CLASS[tx.type]}`}>
                  {tx.type === "INCOME" ? "+" : tx.type === "EXPENSE" ? "−" : ""}€{tx.amount}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
