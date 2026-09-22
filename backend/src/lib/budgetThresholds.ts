export const BUDGET_WARNING_THRESHOLD = 80;
export const BUDGET_DANGER_THRESHOLD = 100;

export function budgetStatus(percentUsed: number): "ok" | "warning" | "danger" {
  if (percentUsed >= BUDGET_DANGER_THRESHOLD) return "danger";
  if (percentUsed >= BUDGET_WARNING_THRESHOLD) return "warning";
  return "ok";
}
