"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useCategories, useCreateCategory, useDeleteCategory, useUpdateCategory } from "@/hooks/useCategories";
import { Category, TransactionType } from "@/schemas/category.schema";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { IconPicker } from "@/components/ui/IconPicker";
import { RainbowColorInput } from "@/components/ui/RainbowColorInput";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const DEFAULT_COLORS = ["#fca5a5", "#fdba74", "#fcd34d", "#86efac", "#93c5fd", "#c4b5fd", "#f9a8d4"];

function EditCategoryForm({
  category,
  onCancel,
  onSaved,
}: {
  category: Category;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const { t } = useLanguage();
  const updateCategory = useUpdateCategory();
  const [nombre, setNombre] = useState(category.nombre);
  const [color, setColor] = useState(category.color);
  const [icono, setIcono] = useState(category.icono);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!nombre.trim()) {
      setError("Name is required");
      return;
    }
    try {
      await updateCategory.mutateAsync({ id: category.id, input: { nombre: nombre.trim(), color, icono } });
      onSaved();
    } catch {
      setError("Could not save changes");
    }
  }

  return (
    <li className="flex flex-col gap-3 py-3 bg-base-200/40 rounded-2xl px-3 -mx-3">
      <div className="flex items-center gap-2">
        <CategoryIcon icono={icono} color={color} />
        <input className="input input-sm flex-1" value={nombre} onChange={(e) => setNombre(e.target.value)} autoFocus />
      </div>
      <div className="flex gap-1.5 items-center">
        {DEFAULT_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            aria-label={`Color ${c}`}
            className={`w-6 h-6 rounded-full border-2 ${color === c ? "border-base-content" : "border-transparent"}`}
            style={{ backgroundColor: c }}
            onClick={() => setColor(c)}
          />
        ))}
        <RainbowColorInput value={color} onChange={setColor} label={t("categories.customColor")} size="w-6 h-6" />
      </div>
      <IconPicker value={icono} onChange={setIcono} color={color} />
      {error && <span className="text-error text-xs">{error}</span>}
      <div className="flex gap-2 justify-end">
        <button type="button" className="btn btn-sm btn-ghost" onClick={onCancel}>
          {t("common.cancel")}
        </button>
        <button type="button" className="btn btn-sm btn-primary" onClick={handleSave} disabled={updateCategory.isPending}>
          {t("common.save")}
        </button>
      </div>
    </li>
  );
}

export default function CategoriesPage() {
  const { t } = useLanguage();
  const TYPE_LABELS: Record<TransactionType, string> = {
    INCOME: t("categories.income"),
    EXPENSE: t("categories.expenses"),
    INVESTMENT: t("categories.investments"),
  };
  const { data: categories = [], isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();

  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState<TransactionType>("EXPENSE");
  const [color, setColor] = useState(DEFAULT_COLORS[0]);
  const [icono, setIcono] = useState("tag");
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<{ id: string; message: string } | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!nombre.trim()) {
      setError("Name is required");
      return;
    }
    try {
      await createCategory.mutateAsync({ nombre: nombre.trim(), tipo, color, icono });
      setNombre("");
      setIcono("tag");
    } catch {
      setError("Could not create the category");
    }
  }

  async function handleDelete(id: string) {
    setDeleteError(null);
    try {
      await deleteCategory.mutateAsync(id);
    } catch {
      setDeleteError({ id, message: t("categories.deleteError") });
    }
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="card-title">{t("categories.newCategory")}</h2>
          <form onSubmit={handleCreate} className="flex flex-col gap-3">
            <div className="flex gap-3 items-center">
              <CategoryIcon icono={icono} color={color} size="lg" />
              <input
                className="input flex-1"
                placeholder={t("categories.name")}
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
              <select className="select" value={tipo} onChange={(e) => setTipo(e.target.value as TransactionType)}>
                {Object.entries(TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-1.5 items-center">
              {DEFAULT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={`Color ${c}`}
                  className={`w-7 h-7 rounded-full border-2 ${color === c ? "border-base-content" : "border-transparent"}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
              <RainbowColorInput value={color} onChange={setColor} label={t("categories.customColor")} />
            </div>
            <IconPicker value={icono} onChange={setIcono} color={color} />
            <button type="submit" className="btn btn-primary self-end" disabled={createCategory.isPending}>
              {t("categories.addCategory")}
            </button>
          </form>
          {error && (
            <div role="alert" className="alert alert-error py-2 text-sm mt-2">
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <p className="opacity-60">{t("common.loading")}</p>
      ) : (
        (Object.keys(TYPE_LABELS) as TransactionType[]).map((type) => {
          const items = categories.filter((c) => c.tipo === type);
          if (items.length === 0) return null;
          return (
            <div key={type} className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <h3 className="font-semibold">{TYPE_LABELS[type]}</h3>
                <ul className="flex flex-col divide-y divide-base-200">
                  {items.map((category) =>
                    editingId === category.id ? (
                      <EditCategoryForm
                        key={category.id}
                        category={category}
                        onCancel={() => setEditingId(null)}
                        onSaved={() => setEditingId(null)}
                      />
                    ) : (
                      <li key={category.id} className="flex flex-col gap-1 py-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-3">
                            <CategoryIcon icono={category.icono} color={category.color} size="sm" />
                            {category.nombre}
                          </span>
                          <div className="flex gap-1">
                            <button
                              type="button"
                              className="btn btn-ghost btn-xs"
                              onClick={() => setEditingId(category.id)}
                              aria-label={`Edit ${category.nombre}`}
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              type="button"
                              className="btn btn-ghost btn-xs text-error"
                              onClick={() => handleDelete(category.id)}
                              aria-label={`Delete ${category.nombre}`}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        {deleteError?.id === category.id && (
                          <div role="alert" className="alert alert-error py-2 text-sm">
                            <span>{deleteError.message}</span>
                          </div>
                        )}
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
