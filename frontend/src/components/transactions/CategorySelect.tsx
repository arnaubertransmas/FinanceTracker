"use client";

import { useState } from "react";
import { useCategories, useCreateCategory } from "@/hooks/useCategories";
import { TransactionType } from "@/schemas/category.schema";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { IconPicker } from "@/components/ui/IconPicker";

const NEW_CATEGORY_VALUE = "__new__";
const DEFAULT_COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#2563eb", "#7c3aed", "#ec4899"];

export function CategorySelect({
  type,
  value,
  onChange,
}: {
  type: TransactionType;
  value: string;
  onChange: (id: string) => void;
}) {
  const { data: categories = [] } = useCategories();
  const createCategory = useCreateCategory();
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(DEFAULT_COLORS[0]);
  const [newIcon, setNewIcon] = useState("tag");

  const filtered = categories.filter((c) => c.tipo === type);

  function handleSelectChange(e: React.ChangeEvent<HTMLSelectElement>) {
    if (e.target.value === NEW_CATEGORY_VALUE) {
      setIsCreating(true);
      return;
    }
    onChange(e.target.value);
  }

  async function handleCreate() {
    if (!newName.trim()) return;
    const category = await createCategory.mutateAsync({
      nombre: newName.trim(),
      tipo: type,
      color: newColor,
      icono: newIcon,
    });
    onChange(category.id);
    setIsCreating(false);
    setNewName("");
    setNewIcon("tag");
  }

  if (isCreating) {
    return (
      <div className="flex flex-col gap-3 p-3 border border-base-300 rounded-2xl bg-base-200/40">
        <div className="flex items-center gap-2">
          <CategoryIcon icono={newIcon} color={newColor} />
          <input
            className="input input-sm flex-1"
            placeholder="Category name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            autoFocus
          />
        </div>
        <div className="flex gap-1.5">
          {DEFAULT_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`Color ${c}`}
              className={`w-6 h-6 rounded-full border-2 ${newColor === c ? "border-base-content" : "border-transparent"}`}
              style={{ backgroundColor: c }}
              onClick={() => setNewColor(c)}
            />
          ))}
        </div>
        <IconPicker value={newIcon} onChange={setNewIcon} color={newColor} />
        <div className="flex gap-2 justify-end">
          <button type="button" className="btn btn-sm btn-ghost" onClick={() => setIsCreating(false)}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={handleCreate}
            disabled={createCategory.isPending || !newName.trim()}
          >
            Create
          </button>
        </div>
      </div>
    );
  }

  return (
    <select className="select w-full" value={value} onChange={handleSelectChange}>
      <option value="" disabled>
        Choose category
      </option>
      {filtered.map((c) => (
        <option key={c.id} value={c.id}>
          {c.nombre}
        </option>
      ))}
      <option value={NEW_CATEGORY_VALUE}>+ New category</option>
    </select>
  );
}
