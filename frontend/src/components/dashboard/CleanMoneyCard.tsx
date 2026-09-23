import { AlertTriangle, Wallet } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function CleanMoneyCard({ amount }: { amount: number }) {
  const { t } = useLanguage();
  const isPositive = amount >= 0;
  return (
    <div className="card bg-gradient-to-br from-base-100 to-base-200 shadow-sm">
      <div className="card-body items-center text-center py-8 gap-1">
        <span
          className={`inline-flex items-center justify-center w-11 h-11 rounded-full mb-1 ${
            isPositive ? "bg-primary/15 text-primary" : "bg-error/15 text-error"
          }`}
        >
          {isPositive ? <Wallet size={20} strokeWidth={2.25} /> : <AlertTriangle size={20} strokeWidth={2.25} />}
        </span>
        <span className="text-sm uppercase tracking-wide opacity-60">{t("dashboard.wealth")}</span>
        <span className={`text-5xl font-bold ${isPositive ? "text-success" : "text-error"}`}>
          {amount.toLocaleString("en-US", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })}
        </span>
        <span className="text-xs opacity-60">{t("dashboard.wealthHint")}</span>

        {!isPositive && (
          <div role="alert" className="alert alert-error py-2 px-3 mt-3 text-sm w-full">
            <AlertTriangle size={16} />
            <span>{t("dashboard.overspent")}</span>
          </div>
        )}
      </div>
    </div>
  );
}
