"use client";

import { useCategories } from "@/hooks/useCategories";

export function AssetInput({ value, onChange }: { value: string; onChange: (name: string) => void }) {
  const { data: categories = [] } = useCategories();
  const assets = categories.filter((c) => c.tipo === "INVESTMENT");

  return (
    <>
      <input
        list="asset-options"
        className="input w-full"
        placeholder="Asset (e.g. Bitcoin, Apple, S&P 500 ETF)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <datalist id="asset-options">
        {assets.map((a) => (
          <option key={a.id} value={a.nombre} />
        ))}
      </datalist>
    </>
  );
}
