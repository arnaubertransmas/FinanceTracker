"use client";

import { useState } from "react";
import { TransactionType } from "@/schemas/category.schema";
import { RecurrenceFrequency } from "@/schemas/transaction.schema";
import { useCreateTransaction } from "@/hooks/useTransactions";
import { useFindOrCreateCategory } from "@/hooks/useCategories";
import { TypeSelector } from "@/components/transactions/TypeSelector";
import { CategorySelect } from "@/components/transactions/CategorySelect";
import { AssetInput } from "@/components/transactions/AssetInput";
import { RecurrenceFields } from "@/components/transactions/RecurrenceFields";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function TransactionForm({ onSuccess }: { onSuccess: () => void }) {
  const [type, setType] = useState<TransactionType>("EXPENSE");
  const [categoryId, setCategoryId] = useState("");
  const [assetName, setAssetName] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(todayIso());
  const [recurring, setRecurring] = useState(false);
  const [frequency, setFrequency] = useState<RecurrenceFrequency | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  const createTransaction = useCreateTransaction();
  const findOrCreateCategory = useFindOrCreateCategory();

  function handleTypeChange(next: TransactionType) {
    setType(next);
    setCategoryId("");
    setAssetName("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (type === "INVESTMENT" ? !assetName.trim() : !categoryId) {
      setError(type === "INVESTMENT" ? "Enter an asset" : "Choose a category");
      return;
    }
    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      setError("Amount must be greater than 0");
      return;
    }
    if (recurring && !frequency) {
      setError("Choose a recurrence frequency");
      return;
    }

    try {
      const resolvedCategoryId =
        type === "INVESTMENT"
          ? (await findOrCreateCategory.mutateAsync({ nombre: assetName.trim(), tipo: "INVESTMENT" })).id
          : categoryId;

      await createTransaction.mutateAsync({
        type,
        categoryId: resolvedCategoryId,
        amount: parsedAmount,
        description: description.trim() || undefined,
        date,
        recurring,
        recurrenceFrequency: recurring ? frequency : undefined,
      });
      onSuccess();
    } catch {
      setError("Could not save the transaction");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <TypeSelector value={type} onChange={handleTypeChange} />

      {type === "INVESTMENT" ? (
        <AssetInput value={assetName} onChange={setAssetName} />
      ) : (
        <CategorySelect type={type} value={categoryId} onChange={setCategoryId} />
      )}

      <label className="input w-full">
        <span className="opacity-60">€</span>
        <input
          type="number"
          step="0.01"
          min="0"
          placeholder="Amount"
          className="grow"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </label>

      <input
        type="text"
        placeholder="Description (optional)"
        className="input w-full"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <input type="date" className="input w-full" value={date} onChange={(e) => setDate(e.target.value)} />

      <RecurrenceFields
        recurring={recurring}
        frequency={frequency}
        onRecurringChange={setRecurring}
        onFrequencyChange={setFrequency}
      />

      {error && (
        <div role="alert" className="alert alert-error py-2 text-sm">
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        className="btn btn-primary mt-1"
        disabled={createTransaction.isPending || findOrCreateCategory.isPending}
      >
        {createTransaction.isPending ? "Saving..." : "Save transaction"}
      </button>
    </form>
  );
}
