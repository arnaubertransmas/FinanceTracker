"use client";

import { useState } from "react";
import { AlertTriangle, Wallet, PiggyBank, ArrowUpCircle, ArrowDownCircle, TrendingUp } from "lucide-react";
import { Cell, Pie, PieChart, PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer, Tooltip } from "recharts";
import { useCategoryBreakdown } from "@/hooks/useDashboard";
import { DashboardSummary } from "@/schemas/dashboard.schema";

type InsightTab = "total" | "savings" | "income" | "spending" | "investing";

const TABS: { key: InsightTab; label: string; icon: typeof PiggyBank }[] = [
  { key: "total", label: "Total income", icon: Wallet },
  { key: "savings", label: "Savings rate", icon: PiggyBank },
  { key: "income", label: "Income", icon: ArrowUpCircle },
  { key: "spending", label: "Spending", icon: ArrowDownCircle },
  { key: "investing", label: "Investing", icon: TrendingUp },
];

const INCOME_SHADES = ["#16a34a", "#22c55e", "#4ade80", "#86efac", "#bbf7d0"];
const INVEST_SHADES = ["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe"];
const SPEND_SHADES = ["#dc2626", "#ef4444", "#f87171", "#fca5a5", "#fecaca"];

function formatEuro(value: number) {
  return value.toLocaleString("en-US", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
}

function SavingsRing({ percent }: { percent: number }) {
  const clamped = Math.max(0, Math.min(100, percent));
  const color = clamped >= 20 ? "var(--color-success)" : clamped >= 0 ? "var(--color-warning)" : "var(--color-error)";
  const data = [{ value: Math.abs(clamped), fill: color }];

  return (
    <div className="relative w-36 h-36 shrink-0">
      <RadialBarChart width={144} height={144} innerRadius="70%" outerRadius="100%" data={data} startAngle={90} endAngle={-270}>
        <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
        <RadialBar dataKey="value" cornerRadius={8} background={{ fill: "var(--color-base-200)" }} />
      </RadialBarChart>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-3xl font-bold">{percent.toFixed(0)}%</span>
      </div>
    </div>
  );
}

function CategoryPie({
  data,
  shades,
}: {
  data: { nombre: string; color: string; total: string }[];
  shades?: string[];
}) {
  const chartData = data.map((d, i) => ({
    name: d.nombre,
    value: Number(d.total),
    color: shades ? shades[i % shades.length] : d.color,
  }));

  if (chartData.length === 0) {
    return <div className="w-36 h-36 shrink-0 flex items-center justify-center text-xs opacity-50">No data</div>;
  }

  return (
    <div className="w-36 h-36 shrink-0">
      <ResponsiveContainer>
        <PieChart>
          <Pie data={chartData} dataKey="value" nameKey="name" innerRadius="60%" outerRadius="100%" paddingAngle={2}>
            {chartData.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => Number(value).toLocaleString("en-US", { style: "currency", currency: "EUR" })}
            contentStyle={{ fontSize: 12 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function AllocationPie({ income, expense, invested }: { income: number; expense: number; invested: number }) {
  const savings = Math.max(income - expense - invested, 0);
  const total = savings + invested + expense;

  const data = [
    { name: "Saved", value: savings, color: "var(--color-success)" },
    { name: "Invested", value: invested, color: "var(--color-info)" },
    { name: "Spent", value: expense, color: "var(--color-error)" },
  ].filter((d) => d.value > 0);

  if (total === 0) {
    return <div className="w-36 h-36 shrink-0 flex items-center justify-center text-xs opacity-50">No data</div>;
  }

  return (
    <div className="w-36 h-36 shrink-0">
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="100%" paddingAngle={2}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => Number(value).toLocaleString("en-US", { style: "currency", currency: "EUR" })}
            contentStyle={{ fontSize: 12 }}
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
  year: number;
  month?: number;
  summary?: DashboardSummary;
}) {
  const [tab, setTab] = useState<InsightTab>("total");
  const breakdownType = tab === "income" ? "INCOME" : tab === "investing" ? "INVESTMENT" : "EXPENSE";
  const { data: breakdown = [] } = useCategoryBreakdown(year, month, breakdownType);

  const totals: Record<InsightTab, { label: string; amount: number; color: string }> = {
    total: { label: "Total income", amount: Number(summary?.income ?? 0), color: "text-success" },
    savings: { label: "Saved", amount: Number(summary?.cleanMoney ?? 0), color: "text-success" },
    income: { label: "Total income", amount: Number(summary?.income ?? 0), color: "text-success" },
    spending: { label: "Total spent", amount: Number(summary?.expense ?? 0), color: "text-error" },
    investing: { label: "Total invested", amount: Number(summary?.investment ?? 0), color: "text-info" },
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
              className={`btn btn-xs sm:btn-sm rounded-full gap-1.5 shrink-0 ${
                tab === key ? "btn-primary" : "btn-ghost bg-base-200"
              }`}
              onClick={() => setTab(key)}
            >
              <Icon size={13} />
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
            <div className="text-xs uppercase tracking-wide opacity-60">{active.label}</div>
            <div className={`text-3xl font-bold ${active.color}`}>{formatEuro(active.amount)}</div>
            {tab === "total" && <div className="text-xs opacity-50 mt-1">Where your income goes</div>}
          </div>
        </div>

        {tab === "total" && overspent > 0 && (
          <div role="alert" className="alert alert-warning py-2 px-3 mt-3 text-sm">
            <AlertTriangle size={16} />
            <span>You spent and invested {formatEuro(overspent)} more than you earned this period.</span>
          </div>
        )}
      </div>
    </div>
  );
}
