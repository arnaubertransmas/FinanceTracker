"use client";

import { useState } from "react";
import { AlertTriangle, Wallet, PiggyBank, ArrowUpCircle, ArrowDownCircle, TrendingUp } from "lucide-react";
import { Cell, Pie, PieChart, PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer, Tooltip } from "recharts";
import { useCategoryBreakdown } from "@/hooks/useDashboard";
import { DashboardSummary } from "@/schemas/dashboard.schema";
import { useLanguage } from "@/lib/i18n/LanguageContext";

type InsightTab = "total" | "savings" | "income" | "spending" | "investing";

const INCOME_SHADES = ["#4ade80", "#86efac", "#bbf7d0", "#dcfce7", "#f0fdf4"];
const INVEST_SHADES = ["#60a5fa", "#93c5fd", "#bfdbfe", "#dbeafe", "#eff6ff"];
const SPEND_SHADES = ["#f87171", "#fca5a5", "#fecaca", "#fee2e2", "#fef2f2"];

function shadeForCategory(categoryId: string, shades: string[]) {
  let hash = 0;
  for (let i = 0; i < categoryId.length; i++) {
    hash = (hash * 31 + categoryId.charCodeAt(i)) | 0;
  }
  return shades[Math.abs(hash) % shades.length];
}

function formatEuro(value: number) {
  return value.toLocaleString("en-US", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
}

function SavingsRing({ percent }: { percent: number }) {
  const color = percent >= 20 ? "var(--color-success)" : percent >= 0 ? "var(--color-warning)" : "var(--color-error)";
  const clamped = Math.max(0, Math.min(100, percent));
  const data = [{ value: clamped, fill: color }];

  return (
    <div className="relative w-40 h-40 shrink-0">
      <RadialBarChart width={160} height={160} innerRadius="70%" outerRadius="100%" data={data} startAngle={90} endAngle={-270}>
        <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
        <RadialBar dataKey="value" cornerRadius={8} background={{ fill: "var(--color-base-200)" }} />
      </RadialBarChart>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-4xl font-bold" style={{ color }}>
          {percent.toFixed(0)}%
        </span>
      </div>
    </div>
  );
}

function CategoryPie({
  data,
  shades,
}: {
  data: { categoryId: string; nombre: string; total: string }[];
  shades: string[];
}) {
  const { t } = useLanguage();
  const chartData = data.map((d) => ({
    name: d.nombre,
    value: Number(d.total),
    color: shadeForCategory(d.categoryId, shades),
  }));

  if (chartData.length === 0) {
    return <div className="w-40 h-40 shrink-0 flex items-center justify-center text-xs opacity-50">{t("common.noData")}</div>;
  }

  return (
    <div className="w-40 h-40 shrink-0">
      <ResponsiveContainer>
        <PieChart>
          <Pie data={chartData} dataKey="value" nameKey="name" innerRadius="60%" outerRadius="100%" paddingAngle={2}>
            {chartData.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => Number(value).toLocaleString("en-US", { style: "currency", currency: "EUR" })}
            contentStyle={{
              fontSize: 12,
              backgroundColor: "var(--color-base-100)",
              border: "1px solid var(--color-base-300)",
              color: "var(--color-base-content)",
            }}
            labelStyle={{ color: "var(--color-base-content)" }}
            itemStyle={{ color: "var(--color-base-content)" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function AllocationPie({ income, expense, invested }: { income: number; expense: number; invested: number }) {
  const { t } = useLanguage();
  const savings = Math.max(income - expense - invested, 0);
  const total = savings + invested + expense;

  const data = [
    { name: "Saved", value: savings, color: "var(--color-success)" },
    { name: "Invested", value: invested, color: "var(--color-info)" },
    { name: "Spent", value: expense, color: "var(--color-error)" },
  ].filter((d) => d.value > 0);

  if (total === 0) {
    return <div className="w-40 h-40 shrink-0 flex items-center justify-center text-xs opacity-50">{t("common.noData")}</div>;
  }

  return (
    <div className="w-40 h-40 shrink-0">
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="100%" paddingAngle={2}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => Number(value).toLocaleString("en-US", { style: "currency", currency: "EUR" })}
            contentStyle={{
              fontSize: 12,
              backgroundColor: "var(--color-base-100)",
              border: "1px solid var(--color-base-300)",
              color: "var(--color-base-content)",
            }}
            labelStyle={{ color: "var(--color-base-content)" }}
            itemStyle={{ color: "var(--color-base-content)" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function InsightsCard({
  year,
  month,
  summary,
}: {
  year?: number;
  month?: number;
  summary?: DashboardSummary;
}) {
  const { t } = useLanguage();
  const [tab, setTab] = useState<InsightTab>("total");
  const breakdownType = tab === "income" ? "INCOME" : tab === "investing" ? "INVESTMENT" : "EXPENSE";
  const { data: breakdown = [] } = useCategoryBreakdown(year, month, breakdownType);

  const TABS: { key: InsightTab; label: string; icon: typeof PiggyBank }[] = [
    { key: "total", label: t("insights.overview"), icon: Wallet },
    { key: "savings", label: t("insights.savingsRate"), icon: PiggyBank },
    { key: "income", label: t("insights.income"), icon: ArrowUpCircle },
    { key: "spending", label: t("insights.spending"), icon: ArrowDownCircle },
    { key: "investing", label: t("insights.investing"), icon: TrendingUp },
  ];

  const cleanMoney = Number(summary?.cleanMoney ?? 0);

  const totals: Record<InsightTab, { label: string; amount: number; color: string }> = {
    total: { label: t("insights.totalIncome"), amount: Number(summary?.income ?? 0), color: "text-success" },
    savings: { label: t("insights.saved"), amount: cleanMoney, color: cleanMoney >= 0 ? "text-success" : "text-error" },
    income: { label: t("insights.totalIncome"), amount: Number(summary?.income ?? 0), color: "text-success" },
    spending: { label: t("insights.totalSpent"), amount: Number(summary?.expense ?? 0), color: "text-error" },
    investing: { label: t("insights.totalInvested"), amount: Number(summary?.investment ?? 0), color: "text-info" },
  };
  const active = totals[tab];
  const overspent = summary ? Number(summary.expense) + Number(summary.investment) - Number(summary.income) : 0;

  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body">
        <div className="flex flex-wrap gap-1.5">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              className={`btn btn-sm sm:btn-md rounded-full gap-1.5 shrink-0 ${
                tab === key ? "btn-primary" : "btn-ghost bg-base-200"
              }`}
              onClick={() => setTab(key)}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-6 mt-3">
          {tab === "total" && summary && (
            <AllocationPie income={Number(summary.income)} expense={Number(summary.expense)} invested={Number(summary.investment)} />
          )}
          {tab === "savings" && <SavingsRing percent={Number(summary?.savingsPercent ?? 0)} />}
          {(tab === "income" || tab === "spending" || tab === "investing") && (
            <CategoryPie
              data={breakdown}
              shades={tab === "income" ? INCOME_SHADES : tab === "investing" ? INVEST_SHADES : SPEND_SHADES}
            />
          )}

          <div>
            <div className="text-sm uppercase tracking-wide opacity-60">{active.label}</div>
            <div className={`text-4xl font-bold ${active.color}`}>{formatEuro(active.amount)}</div>
            {tab === "total" && <div className="text-xs opacity-50 mt-1">{t("insights.whereIncomeGoes")}</div>}
          </div>
        </div>

        {tab === "total" && overspent > 0 && (
          <div role="alert" className="alert alert-warning py-2 px-3 mt-3 text-sm">
            <AlertTriangle size={16} />
            <span>{t("insights.overspentAlert", { amount: formatEuro(overspent) })}</span>
          </div>
        )}
      </div>
    </div>
  );
}
