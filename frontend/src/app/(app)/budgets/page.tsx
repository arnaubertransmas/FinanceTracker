"use client";

import { useState } from "react";
import { Pencil, PiggyBank, Plus, Trash2 } from "lucide-react";
import { useBudgets, useBudgetsProgress, useDeleteBudget, useUpdateBudget } from "@/hooks/useBudgets";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { AddModal } from "@/components/add/AddModal";
import type { Budget } from "@/schemas/budget.schema";

const STATUS_BAR_CLASS: Record<string, string> = {
  ok: "progress-success",
  warning: "progress-warning",
  danger: "progress-error",
};

function EditBudgetForm({ budget, onCancel, onSaved }: { budget: Budget; onCancel: () => void; onSaved: () => void }) {
  const updateBudget = useUpdateBudget();
  const [limitType, setLimitType] = useState<"FIXED" | "PERCENTAGE">(budget.limitType);
  const [monthlyLimit, setMonthlyLimit] = useState(budget.monthlyLimit ?? "");
  const [percentage, setPercentage] = useState(budget.percentage ?? "");
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setError(null);
    try {
      await updateBudget.mutateAsync({
        id: budget.id,
        input: {
          limitType,
          monthlyLimit: limitType === "FIXED" ? Number(monthlyLimit) : undefined,
          percentage: limitType === "PERCENTAGE" ? Number(percentage) : undefined,
        },
      });
      onSaved();
    } catch {
      setError("Could not save changes");
    }
  }

  return (
    <li className="flex flex-col gap-2 py-3 bg-base-200/40 rounded-2xl px-3 -mx-3">
      <span className="flex items-center gap-2 font-medium">
        <CategoryIcon icono={budget.category.icono} color={budget.category.color} size="sm" />
        {budget.category.nombre}
      </span>
      <div className="flex gap-2 flex-wrap items-center">
        <select
          className="select select-sm"
          value={limitType}
          onChange={(e) => setLimitType(e.target.value as "FIXED" | "PERCENTAGE")}
        >
          <option value="FIXED">Fixed amount</option>
          <option value="PERCENTAGE">% of income</option>
        </select>
        {limitType === "FIXED" ? (
          <label className="input input-sm w-32">
            <span className="opacity-60">€</span>
            <input
              type="number"
              step="0.01"
              min="0"
              className="grow"
              value={monthlyLimit}
              onChange={(e) => setMonthlyLimit(e.target.value)}
            />
          </label>
        ) : (
          <label className="input input-sm w-28">
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              className="grow"
              value={percentage}
              onChange={(e) => setPercentage(e.target.value)}
            />
            <span className="opacity-60">%</span>
          </label>
        )}
      </div>
      {error && <span className="text-error text-xs">{error}</span>}
      <div className="flex gap-2 justify-end">
        <button type="button" className="btn btn-sm btn-ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className="btn btn-sm btn-primary" onClick={handleSave} disabled={updateBudget.isPending}>
          Save
        </button>
      </div>
    </li>
  );
}

export default function BudgetsPage() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const { data: budgets = [], isLoading } = useBudgetsProgress(month, year);
  const { data: rawBudgets = [] } = useBudgets();
  const deleteBudget = useDeleteBudget();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const rawById = new Map(rawBudgets.map((b) => [b.id, b]));

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Budgets</h1>
        <button type="button" className="btn btn-primary btn-sm gap-1.5" onClick={() => setIsAddOpen(true)}>
          <Plus size={16} />
          New budget
        </button>
      </div>

      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h3 className="font-semibold mb-2">This month</h3>
          {isLoading ? (
            <p className="opacity-60">Loading...</p>
          ) : budgets.length === 0 ? (
            <div className="flex flex-col items-center text-center gap-2 py-8 opacity-60">
              <PiggyBank size={32} />
              <p>No budgets yet. Tap &quot;New budget&quot; to set a monthly limit for a category.</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {budgets.map((budget) => {
                const rawBudget = rawById.get(budget.id);
                if (editingId === budget.id && rawBudget) {
                  return (
                    <EditBudgetForm
                      key={budget.id}
                      budget={rawBudget}
                      onCancel={() => setEditingId(null)}
                      onSaved={() => setEditingId(null)}
                    />
                  );
                }

                const percentUsed = Math.min(Number(budget.percentUsed), 999);
                return (
                  <li key={budget.id} className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        <CategoryIcon icono={budget.category.icono} color={budget.category.color} size="sm" />
                        {budget.category.nombre}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm opacity-70">
                          €{budget.spent} / €{budget.limit} ({Number(budget.percentUsed).toFixed(0)}%)
                        </span>
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs"
                          onClick={() => setEditingId(budget.id)}
                          aria-label={`Edit budget for ${budget.category.nombre}`}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs text-error"
                          onClick={() => deleteBudget.mutate(budget.id)}
                          aria-label={`Delete budget for ${budget.category.nombre}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <progress
                      className={`progress w-full ${STATUS_BAR_CLASS[budget.status]}`}
                      value={Math.min(percentUsed, 100)}
                      max={100}
                    />
                    {budget.status === "danger" && (
                      <span className="text-error text-xs font-semibold">Over budget!</span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <AddModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} initialTab="budget" />
    </div>
  );
}
