"use client";

import { ArrowDownCircle, ArrowUpCircle, TrendingUp, type LucideIcon } from "lucide-react";
import { TransactionType } from "@/schemas/category.schema";

const OPTIONS: { value: TransactionType; label: string; icon: LucideIcon; activeClass: string }[] = [
  { value: "INCOME", label: "Income", icon: ArrowUpCircle, activeClass: "btn-success" },
  { value: "EXPENSE", label: "Expense", icon: ArrowDownCircle, activeClass: "btn-error" },
  { value: "INVESTMENT", label: "Invest", icon: TrendingUp, activeClass: "btn-info" },
];

export function TypeSelector({ value, onChange }: { value: TransactionType; onChange: (type: TransactionType) => void }) {
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
            <span className="text-sm">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
