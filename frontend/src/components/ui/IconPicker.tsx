import { ICON_KEYS, getIcon } from "@/lib/icons";

export function IconPicker({ value, onChange, color }: { value: string; onChange: (key: string) => void; color: string }) {
  return (
    <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1">
      {ICON_KEYS.map((key) => {
        const Icon = getIcon(key);
        const active = value === key;
        return (
          <button
            key={key}
            type="button"
            aria-label={key}
            onClick={() => onChange(key)}
            className={`w-8 h-8 rounded-full inline-flex items-center justify-center transition-colors ${
              active ? "ring-2 ring-offset-1 ring-offset-base-100" : "opacity-60 hover:opacity-100"
            }`}
            style={{
              backgroundColor: active ? `${color}33` : "transparent",
              color,
              ...(active ? ({ ["--tw-ring-color" as string]: color } as React.CSSProperties) : {}),
            }}
          >
            <Icon size={16} strokeWidth={2.25} />
          </button>
        );
      })}
    </div>
  );
}
