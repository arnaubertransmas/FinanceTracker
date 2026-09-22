import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { CategoryBreakdownItem, DashboardSummary } from "@/schemas/dashboard.schema";

export function useDashboardSummary(year: number, month?: number) {
  return useQuery({
    queryKey: ["dashboard", "summary", year, month ?? "year"],
    queryFn: () => api.get<DashboardSummary>(`/dashboard/summary?year=${year}${month ? `&month=${month}` : ""}`),
  });
}

export function useCategoryBreakdown(
  year: number,
  month: number | undefined,
  type: "INCOME" | "EXPENSE" | "INVESTMENT" = "EXPENSE"
) {
  return useQuery({
    queryKey: ["dashboard", "category-breakdown", year, month ?? "year", type],
    queryFn: () =>
      api
        .get<{
          categories: CategoryBreakdownItem[];
        }>(`/dashboard/category-breakdown?year=${year}${month ? `&month=${month}` : ""}&type=${type}`)
        .then((r) => r.categories),
  });
}

export function useAvailableYears() {
  return useQuery({
    queryKey: ["dashboard", "available-years"],
    queryFn: () => api.get<{ years: number[] }>("/dashboard/available-years").then((r) => r.years),
  });
}
