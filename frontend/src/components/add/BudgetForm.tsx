"use client";

import { useState } from "react";
import { useCategories } from "@/hooks/useCategories";
import { useCreateBudget } from "@/hooks/useBudgets";

export function BudgetForm({ onSuccess }: { onSuccess: () => void }) {
  const { data: categories = [] } = useCategories();
  const createBudget = useCreateBudget();
  const expenseCategories = categories.filter((c) => c.tipo === "EXPENSE");

  const [categoryId, setCategoryId] = useState("");
  const [limitType, setLimitType] = useState<"FIXED" | "PERCENTAGE">("FIXED");
  const [monthlyLimit, setMonthlyLimit] = useState("");
  const [percentage, setPercentage] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!categoryId) {
      setError("Choose a category");
      return;
    }
    try {
      await createBudget.mutateAsync({
        categoryId,
        limitType,
        monthlyLimit: limitType === "FIXED" ? Number(monthlyLimit) : undefined,
        percentage: limitType === "PERCENTAGE" ? Number(percentage) : undefined,
      });
      onSuccess();
    } catch {
      setError("Could not create the budget (maybe one already exists for this category?)");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {expenseCategories.length === 0 ? (
        <p className="text-sm opacity-70">Create an expense category first (add an expense transaction to create one inline).</p>
      ) : (
        <>
          <select className="select w-full" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="" disabled>
              Category
            </option>
            {expenseCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
          <select
            className="select w-full"
            value={limitType}
            onChange={(e) => setLimitType(e.target.value as "FIXED" | "PERCENTAGE")}
          >
            <option value="FIXED">Fixed amount</option>
            <option value="PERCENTAGE">% of income</option>
          </select>
          {limitType === "FIXED" ? (
            <label className="input w-full">
              <span className="opacity-60">€</span>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Monthly limit"
                className="grow"
                value={monthlyLimit}
                onChange={(e) => setMonthlyLimit(e.target.value)}
              />
            </label>
          ) : (
            <label className="input w-full">
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                placeholder="% of income"
                className="grow"
                value={percentage}
                onChange={(e) => setPercentage(e.target.value)}
              />
              <span className="opacity-60">%</span>
            </label>
          )}
        </>
      )}

      {error && (
        <div role="alert" className="alert alert-error py-2 text-sm">
          <span>{error}</span>
        </div>
      )}

      <button type="submit" className="btn btn-primary mt-1" disabled={createBudget.isPending || expenseCategories.length === 0}>
        {createBudget.isPending ? "Saving..." : "Save budget"}
      </button>
    </form>
  );
}
