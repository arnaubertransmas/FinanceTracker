import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { CategoryBreakdownItem, DashboardSummary, HistoryPoint } from "@/schemas/dashboard.schema";

export function useDashboardSummary(year: number | undefined, month?: number) {
  return useQuery({
    queryKey: ["dashboard", "summary", year ?? "all", month ?? "year"],
    queryFn: () =>
      api.get<DashboardSummary>(
        `/dashboard/summary?${year !== undefined ? `year=${year}` : ""}${month ? `&month=${month}` : ""}`
      ),
  });
}

export function useCategoryBreakdown(
  year: number | undefined,
  month: number | undefined,
  type: "INCOME" | "EXPENSE" | "INVESTMENT" = "EXPENSE"
) {
  return useQuery({
    queryKey: ["dashboard", "category-breakdown", year ?? "all", month ?? "year", type],
    queryFn: () =>
      api
        .get<{
          categories: CategoryBreakdownItem[];
        }>(
          `/dashboard/category-breakdown?${year !== undefined ? `year=${year}` : ""}${month ? `&month=${month}` : ""}&type=${type}`
        )
        .then((r) => r.categories),
  });
}

export function useAvailableYears() {
  return useQuery({
    queryKey: ["dashboard", "available-years"],
    queryFn: () => api.get<{ years: number[] }>("/dashboard/available-years").then((r) => r.years),
  });
}

export function useDashboardHistory() {
  return useQuery({
    queryKey: ["dashboard", "history"],
    queryFn: () => api.get<{ series: HistoryPoint[] }>("/dashboard/history").then((r) => r.series),
  });
}
