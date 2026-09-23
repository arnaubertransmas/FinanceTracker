"use client";

export function RainbowColorInput({
  value,
  onChange,
  label,
  size = "w-7 h-7",
}: {
  value: string;
  onChange: (color: string) => void;
  label: string;
  size?: string;
}) {
  return (
    <div className={`relative ${size} rounded-full overflow-hidden shrink-0`}>
      <div
        className="absolute inset-0"
        style={{
          background:
            "conic-gradient(from 0deg, #ef4444, #f97316, #eab308, #22c55e, #06b6d4, #3b82f6, #a855f7, #ec4899, #ef4444)",
        }}
      />
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        aria-label={label}
        title={label}
      />
    </div>
  );
}
