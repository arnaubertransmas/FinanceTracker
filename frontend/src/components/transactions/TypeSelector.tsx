"use client";

import { ArrowDownCircle, ArrowUpCircle, TrendingUp, type LucideIcon } from "lucide-react";
import { TransactionType } from "@/schemas/category.schema";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { TranslationKey } from "@/lib/i18n/translations";

const OPTIONS: { value: TransactionType; labelKey: TranslationKey; icon: LucideIcon; activeClass: string }[] = [
  { value: "INCOME", labelKey: "transactions.typeIncome", icon: ArrowUpCircle, activeClass: "btn-success" },
  { value: "EXPENSE", labelKey: "transactions.typeExpense", icon: ArrowDownCircle, activeClass: "btn-error" },
  { value: "INVESTMENT", labelKey: "transactions.typeInvest", icon: TrendingUp, activeClass: "btn-info" },
];

export function TypeSelector({ value, onChange }: { value: TransactionType; onChange: (type: TransactionType) => void }) {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-3 gap-2">
      {OPTIONS.map((option) => {
        const Icon = option.icon;
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            className={`btn h-20 flex-col gap-1 ${active ? option.activeClass : "btn-outline"}`}
            onClick={() => onChange(option.value)}
          >
            <Icon size={22} strokeWidth={2} />
            <span className="text-sm">{t(option.labelKey)}</span>
          </button>
        );
      })}
    </div>
  );
}
