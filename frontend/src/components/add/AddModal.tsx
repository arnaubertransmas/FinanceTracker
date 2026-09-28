"use client";

import { useEffect, useState } from "react";
import { ArrowLeftRight, PiggyBank } from "lucide-react";
import { TransactionForm } from "./TransactionForm";
import { BudgetForm } from "./BudgetForm";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { TranslationKey } from "@/lib/i18n/translations";

export type AddTab = "transaction" | "budget";

const TABS: { key: AddTab; labelKey: TranslationKey; icon: typeof ArrowLeftRight }[] = [
  { key: "transaction", labelKey: "transactions.tabTransaction", icon: ArrowLeftRight },
  { key: "budget", labelKey: "transactions.tabBudget", icon: PiggyBank },
];

export function AddModal({
  isOpen,
  onClose,
  initialTab = "transaction",
}: {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: AddTab;
}) {
  const { t } = useLanguage();
  const [tab, setTab] = useState<AddTab>(initialTab);

  useEffect(() => {
    if (isOpen) setTab(initialTab);
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  return (
    <div className="modal modal-open modal-bottom sm:modal-middle">
      <div className="modal-box">
        <div role="tablist" className="tabs tabs-box mb-4 w-full">
          {TABS.map(({ key, labelKey, icon: Icon }) => (
            <button
              key={key}
              type="button"
              role="tab"
              className={`tab flex-1 gap-1.5 ${tab === key ? "tab-active" : ""}`}
              onClick={() => setTab(key)}
            >
              <Icon size={15} strokeWidth={2.25} />
              {t(labelKey)}
            </button>
          ))}
        </div>

        {tab === "transaction" && <TransactionForm onSuccess={onClose} />}
        {tab === "budget" && <BudgetForm onSuccess={onClose} />}

        <button type="button" className="btn btn-ghost btn-sm mt-3 w-full" onClick={onClose}>
          {t("common.cancel")}
        </button>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
}
