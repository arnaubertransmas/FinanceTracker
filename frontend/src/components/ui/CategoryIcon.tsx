import { getIcon } from "@/lib/icons";

export function CategoryIcon({
  icono,
  color,
  size = "md",
}: {
  icono: string;
  color: string;
  size?: "sm" | "md" | "lg";
}) {
  const Icon = getIcon(icono);
  const dimensions = size === "sm" ? "w-7 h-7" : size === "lg" ? "w-12 h-12" : "w-9 h-9";
  const iconSize = size === "sm" ? 14 : size === "lg" ? 22 : 17;

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full shrink-0 ${dimensions}`}
      style={{ backgroundColor: `${color}22`, color }}
    >
      <Icon size={iconSize} strokeWidth={2.25} />
    </span>
  );
}
