"use client";

import { useState } from "react";
import { Pencil, Trash2, TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  useAddSnapshot,
  useDeleteSnapshot,
  useInvestingSummary,
  useSnapshots,
  useUpdateSnapshot,
} from "@/hooks/useInvesting";
import { PortfolioSnapshot } from "@/schemas/investing.schema";
import { useLanguage } from "@/lib/i18n/LanguageContext";

function formatEuro(value: number) {
  return value.toLocaleString("en-US", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
}

function formatDateLabel(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function todayDateOnly() {
  return new Date().toISOString().slice(0, 10);
}

function EditSnapshotForm({
  snapshot,
  onCancel,
  onSaved,
}: {
  snapshot: PortfolioSnapshot;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const { t } = useLanguage();
  const updateSnapshot = useUpdateSnapshot();
  const [date, setDate] = useState(snapshot.date.slice(0, 10));
  const [value, setValue] = useState(snapshot.value);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) {
      setError("Enter a valid amount");
      return;
    }
    try {
      await updateSnapshot.mutateAsync({ id: snapshot.id, date, value: parsed });
      onSaved();
    } catch {
      setError("Could not save changes");
    }
  }

  return (
    <li className="flex flex-col gap-2 py-3 bg-base-200/40 rounded-2xl px-3 -mx-3">
      <div className="flex items-center gap-2">
        <input type="date" className="input input-sm w-40" value={date} onChange={(e) => setDate(e.target.value)} />
        <label className="input input-sm flex-1">
          <span className="opacity-60">€</span>
          <input type="number" step="0.01" min="0" className="grow" value={value} onChange={(e) => setValue(e.target.value)} autoFocus />
        </label>
      </div>
      {error && <span className="text-error text-xs">{error}</span>}
      <div className="flex gap-2 justify-end">
        <button type="button" className="btn btn-sm btn-ghost" onClick={onCancel}>
          {t("common.cancel")}
        </button>
        <button type="button" className="btn btn-sm btn-primary" onClick={handleSave} disabled={updateSnapshot.isPending}>
          {t("common.save")}
        </button>
      </div>
    </li>
  );
}

export default function InvestingPage() {
  const { t } = useLanguage();
  const { data: summary, isLoading } = useInvestingSummary();
  const { data: snapshots = [] } = useSnapshots();
  const addSnapshot = useAddSnapshot();
  const deleteSnapshot = useDeleteSnapshot();

  const [date, setDate] = useState(todayDateOnly());
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function handleAddSnapshot(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) {
      setError("Enter a valid amount");
      return;
    }
    try {
      await addSnapshot.mutateAsync({ date, value: parsed });
      setValue("");
    } catch {
      setError("Could not save the portfolio value");
    }
  }

  const chartData =
    summary?.series.map((point) => ({
      date: point.date,
      invested: Number(point.invested),
      portfolioValue: point.portfolioValue === null ? null : Number(point.portfolioValue),
    })) ?? [];

  const totalInvested = Number(summary?.totalInvested ?? 0);
  const latestValue = summary?.latestPortfolioValue !== null && summary?.latestPortfolioValue !== undefined ? Number(summary.latestPortfolioValue) : null;
  const gainAmount = summary?.gainAmount !== null && summary?.gainAmount !== undefined ? Number(summary.gainAmount) : null;
  const gainPercent = summary?.gainPercent !== null && summary?.gainPercent !== undefined ? Number(summary.gainPercent) : null;
  const gainColor = gainAmount === null ? "opacity-70" : gainAmount >= 0 ? "text-success" : "text-error";
  const lineColor = gainAmount === null ? "#7c3aed" : gainAmount >= 0 ? "#16a34a" : "#dc2626";

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <h1 className="text-xl font-semibold">{t("investing.title")}</h1>

      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <div className="flex flex-wrap gap-6">
            <div>
              <div className="text-xs uppercase tracking-wide opacity-60">{t("investing.totalInvested")}</div>
              <div className="text-2xl font-bold">{formatEuro(totalInvested)}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide opacity-60">{t("investing.currentValue")}</div>
              <div className="text-2xl font-bold">{latestValue === null ? "—" : formatEuro(latestValue)}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide opacity-60">{t("investing.gainLoss")}</div>
              <div className={`text-2xl font-bold ${gainColor}`}>
                {gainAmount === null
                  ? "—"
                  : `${gainAmount >= 0 ? "+" : ""}${formatEuro(gainAmount)} (${gainPercent! >= 0 ? "+" : ""}${gainPercent!.toFixed(1)}%)`}
              </div>
            </div>
          </div>

          {isLoading ? (
            <p className="opacity-60 mt-4">{t("common.loading")}</p>
          ) : chartData.length === 0 ? (
            <div className="flex flex-col items-center text-center gap-2 py-8 opacity-60">
              <TrendingUp size={32} />
              <p>{t("investing.emptyChart")}</p>
            </div>
          ) : (
            <div className="h-64 mt-4">
              <ResponsiveContainer>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-base-200)" />
                  <XAxis dataKey="date" tickFormatter={formatDateLabel} fontSize={12} />
                  <YAxis
                    tickFormatter={(v) => v.toLocaleString("en-US", { style: "currency", currency: "EUR", maximumFractionDigits: 0, notation: "compact" })}
                    fontSize={12}
                    width={60}
                  />
                  <Tooltip
                    labelFormatter={(label) => formatDateLabel(label as string)}
                    formatter={(v) => formatEuro(Number(v))}
                  />
                  <Line type="monotone" dataKey="invested" stroke="#94a3b8" strokeWidth={2} dot={false} name="Invested" />
                  <Line
                    type="monotone"
                    dataKey="portfolioValue"
                    stroke={lineColor}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    connectNulls
                    name="Portfolio value"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="card-title">{t("investing.updateValue")}</h2>
          <form onSubmit={handleAddSnapshot} className="flex gap-2 flex-wrap items-center">
            <input type="date" className="input input-sm" value={date} onChange={(e) => setDate(e.target.value)} />
            <label className="input input-sm w-32">
              <span className="opacity-60">€</span>
              <input type="number" step="0.01" min="0" className="grow" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Value" />
            </label>
            <button type="submit" className="btn btn-primary btn-sm" disabled={addSnapshot.isPending}>
              {t("common.save")}
            </button>
          </form>
          {error && (
            <div role="alert" className="alert alert-error py-2 text-sm mt-2">
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>

      {snapshots.length > 0 && (
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h3 className="font-semibold">{t("investing.history")}</h3>
            <ul className="flex flex-col divide-y divide-base-200">
              {snapshots.map((snapshot) =>
                editingId === snapshot.id ? (
                  <EditSnapshotForm
                    key={snapshot.id}
                    snapshot={snapshot}
                    onCancel={() => setEditingId(null)}
                    onSaved={() => setEditingId(null)}
                  />
                ) : (
                  <li key={snapshot.id} className="flex items-center justify-between gap-2 py-2">
                    <span className="text-sm opacity-70">{snapshot.date.slice(0, 10)}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{formatEuro(Number(snapshot.value))}</span>
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs"
                        onClick={() => setEditingId(snapshot.id)}
                        aria-label={`Edit value for ${snapshot.date.slice(0, 10)}`}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs text-error"
                        onClick={() => deleteSnapshot.mutate(snapshot.id)}
                        aria-label={`Delete value for ${snapshot.date.slice(0, 10)}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
