"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Tags } from "lucide-react";
import { useBudgetsProgress } from "@/hooks/useBudgets";
import { useAvailableYears, useDashboardSummary } from "@/hooks/useDashboard";
import { CleanMoneyCard } from "@/components/dashboard/CleanMoneyCard";
import { InsightsCard } from "@/components/dashboard/InsightsCard";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { MONTH_NAMES } from "@/lib/monthNames";

const STATUS_BAR_CLASS: Record<string, string> = {
  ok: "progress-success",
  warning: "progress-warning",
  danger: "progress-error",
};

function pickDefaultMonth(year: number) {
  const now = new Date();
  return year === now.getFullYear() ? now.getMonth() + 1 : 12;
}

const CURRENT_YEAR = new Date().getFullYear();

export default function DashboardPage() {
  const now = new Date();
  const { t, language } = useLanguage();
  const monthNames = MONTH_NAMES[language];
  const { data: availableYears } = useAvailableYears();

  const years = useMemo(() => {
    if (!availableYears || availableYears.length === 0) return [CURRENT_YEAR];
    return availableYears;
  }, [availableYears]);

  const [view, setView] = useState<"month" | "year" | "all">("month");
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  useEffect(() => {
    if (availableYears && availableYears.length > 0 && !availableYears.includes(year)) {
      setYear(availableYears[0]);
    }
  }, [availableYears, year]);

  const activeYear = view === "all" ? undefined : year;
  const activeMonth = view === "month" ? month : undefined;

  const { data: summary, isLoading: summaryLoading } = useDashboardSummary(activeYear, activeMonth);
  const { data: budgets = [] } = useBudgetsProgress(month, year);

  function handleYearChange(newYear: number) {
    setYear(newYear);
    setMonth(pickDefaultMonth(newYear));
  }

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="join">
          <button
            type="button"
            className={`join-item btn btn-sm ${view === "month" ? "btn-primary" : "btn-ghost bg-base-200"}`}
            onClick={() => setView("month")}
          >
            {t("dashboard.month")}
          </button>
          <button
            type="button"
            className={`join-item btn btn-sm ${view === "year" ? "btn-primary" : "btn-ghost bg-base-200"}`}
            onClick={() => setView("year")}
          >
            {t("dashboard.year")}
          </button>
          <button
            type="button"
            className={`join-item btn btn-sm ${view === "all" ? "btn-primary" : "btn-ghost bg-base-200"}`}
            onClick={() => setView("all")}
          >
            {t("dashboard.all")}
          </button>
        </div>

        {view === "month" && (
          <select className="select select-sm" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {monthNames.map((name, i) => (
              <option key={name} value={i + 1}>
                {name}
              </option>
            ))}
          </select>
        )}

        {view !== "all" && years.length > 1 && (
          <div className="flex gap-2 ml-auto">
            {years.map((y) => (
              <button
                key={y}
                type="button"
                className={`btn btn-sm rounded-full ${y === year ? "btn-primary" : "btn-ghost"}`}
                onClick={() => handleYearChange(y)}
              >
                {y}
              </button>
            ))}
          </div>
        )}
      </div>

      {summaryLoading || !summary ? (
        <p className="opacity-60">{t("common.loading")}</p>
      ) : (
        <>
          <CleanMoneyCard amount={Number(summary.cleanMoney)} />
          <InsightsCard year={activeYear} month={activeMonth} summary={summary} />
        </>
      )}

      {view === "month" && (
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <h3 className="card-title text-base">{t("dashboard.budgetsTitle")}</h3>
              <Link href="/categories" className="btn btn-ghost btn-xs gap-1.5">
                <Tags size={13} />
                {t("dashboard.editCategories")}
              </Link>
            </div>
            {budgets.length === 0 ? (
              <p className="opacity-60 text-sm">{t("dashboard.noBudgets")}</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {budgets.map((budget) => (
                  <li key={budget.id} className="flex flex-col gap-1">
                    <div className="flex justify-between text-base items-center">
                      <span className="flex items-center gap-2">
                        <CategoryIcon icono={budget.category.icono} color={budget.category.color} size="sm" />
                        {budget.category.nombre}
                      </span>
                      <span className="opacity-70">
                        €{budget.spent} / €{budget.limit}
                      </span>
                    </div>
                    <progress
                      className={`progress w-full ${STATUS_BAR_CLASS[budget.status]}`}
                      value={Math.min(Number(budget.percentUsed), 100)}
                      max={100}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
