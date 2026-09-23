"use client";

import { useState } from "react";
import { ArrowLeftRight, Download, Pencil, Repeat, Trash2, Upload } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { useDeleteTransaction, useTransactions, useUpdateTransaction } from "@/hooks/useTransactions";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { CategorySelect } from "@/components/transactions/CategorySelect";
import type { Transaction } from "@/schemas/transaction.schema";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const TYPE_AMOUNT_CLASS: Record<string, string> = {
  INCOME: "text-success",
  EXPENSE: "text-error",
  INVESTMENT: "text-info",
};

function EditTransactionForm({
  transaction,
  onCancel,
  onSaved,
}: {
  transaction: Transaction;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const { t } = useLanguage();
  const updateTransaction = useUpdateTransaction();
  const [categoryId, setCategoryId] = useState(transaction.categoryId);
  const [amount, setAmount] = useState(transaction.amount);
  const [description, setDescription] = useState(transaction.description ?? "");
  const [date, setDate] = useState(transaction.date.slice(0, 10));
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setError(null);
    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      setError("Amount must be greater than 0");
      return;
    }
    try {
      await updateTransaction.mutateAsync({
        id: transaction.id,
        input: { categoryId, amount: parsedAmount, description: description.trim() || undefined, date },
      });
      onSaved();
    } catch {
      setError("Could not save changes");
    }
  }

  return (
    <li className="flex flex-col gap-2 py-3 bg-base-200/40 rounded-2xl px-3 -mx-3">
      <CategorySelect type={transaction.type} value={categoryId} onChange={setCategoryId} />
      <div className="flex gap-2 flex-wrap">
        <label className="input input-sm flex-1 min-w-28">
          <span className="opacity-60">€</span>
          <input
            type="number"
            step="0.01"
            min="0"
            className="grow"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </label>
        <input type="date" className="input input-sm flex-1 min-w-32" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <input
        type="text"
        placeholder="Description (optional)"
        className="input input-sm w-full"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      {error && <span className="text-error text-xs">{error}</span>}
      <div className="flex gap-2 justify-end">
        <button type="button" className="btn btn-sm btn-ghost" onClick={onCancel}>
          {t("common.cancel")}
        </button>
        <button type="button" className="btn btn-sm btn-primary" onClick={handleSave} disabled={updateTransaction.isPending}>
          {t("common.save")}
        </button>
      </div>
    </li>
  );
}

export default function TransactionsPage() {
  const { t } = useLanguage();
  const [type, setType] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: categories = [] } = useCategories();
  const { data, isLoading } = useTransactions({
    type: type || undefined,
    categoryId: categoryId || undefined,
    from: from || undefined,
    to: to || undefined,
  });
  const deleteTransaction = useDeleteTransaction();

  const exportParams = new URLSearchParams();
  if (from) exportParams.set("from", from);
  if (to) exportParams.set("to", to);

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t("activities.title")}</h1>
        <div className="flex gap-1">
          <a href="/import" className="btn btn-ghost btn-sm btn-circle" title="Import CSV" aria-label="Import CSV">
            <Upload size={16} />
          </a>
          <a
            href={`/api/transactions/export${exportParams.toString() ? `?${exportParams.toString()}` : ""}`}
            className="btn btn-ghost btn-sm btn-circle"
            title="Export CSV"
            aria-label="Export CSV"
          >
            <Download size={16} />
          </a>
        </div>
      </div>

      <div className="card bg-base-100 shadow-sm">
        <div className="card-body flex-row flex-wrap gap-3 items-center py-4">
          <select className="select select-sm" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">{t("activities.allTypes")}</option>
            <option value="INCOME">{t("activities.income")}</option>
            <option value="EXPENSE">{t("activities.expenses")}</option>
            <option value="INVESTMENT">{t("activities.investments")}</option>
          </select>
          <select className="select select-sm" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">{t("activities.allCategories")}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
          <input type="date" className="input input-sm" value={from} onChange={(e) => setFrom(e.target.value)} />
          <span className="opacity-50">–</span>
          <input type="date" className="input input-sm" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
      </div>

      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          {isLoading ? (
            <p className="opacity-60">{t("common.loading")}</p>
          ) : !data || data.items.length === 0 ? (
            <div className="flex flex-col items-center text-center gap-2 py-8 opacity-60">
              <ArrowLeftRight size={32} />
              <p>{t("activities.noTransactions")}</p>
            </div>
          ) : (
            <ul className="flex flex-col divide-y divide-base-200">
              {data.items.map((tx) =>
                editingId === tx.id ? (
                  <EditTransactionForm
                    key={tx.id}
                    transaction={tx}
                    onCancel={() => setEditingId(null)}
                    onSaved={() => setEditingId(null)}
                  />
                ) : (
                  <li key={tx.id} className="flex items-center justify-between gap-2 py-2.5">
                    <div className="flex items-center gap-3">
                      <CategoryIcon icono={tx.category.icono} color={tx.category.color} />
                      <div className="flex flex-col">
                        <span className="font-medium">{tx.description || tx.category.nombre}</span>
                        <span className="text-xs opacity-60 flex items-center gap-1">
                          {tx.date.slice(0, 10)}
                          {tx.recurring && (
                            <>
                              <Repeat size={11} /> {t("activities.recurring")}
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-semibold ${TYPE_AMOUNT_CLASS[tx.type]}`}>
                        {tx.type === "EXPENSE" ? "−" : "+"}€{tx.amount}
                      </span>
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs"
                        onClick={() => setEditingId(tx.id)}
                        aria-label="Edit transaction"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs text-error"
                        onClick={() => deleteTransaction.mutate(tx.id)}
                        aria-label="Delete transaction"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </li>
                )
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
