import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Budget, BudgetProgress, CreateBudgetInput, UpdateBudgetInput } from "@/schemas/budget.schema";

export function useBudgets() {
  return useQuery({
    queryKey: ["budgets", "list"],
    queryFn: () => api.get<{ budgets: Budget[] }>("/budgets").then((r) => r.budgets),
  });
}

export function useBudgetsProgress(month: number, year: number) {
  return useQuery({
    queryKey: ["budgets", "progress", month, year],
    queryFn: () => api.get<{ budgets: BudgetProgress[] }>(`/budgets/progress?month=${month}&year=${year}`).then((r) => r.budgets),
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBudgetInput) => api.post<{ budget: Budget }>("/budgets", input).then((r) => r.budget),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["budgets"] }),
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateBudgetInput }) =>
      api.patch<{ budget: Budget }>(`/budgets/${id}`, input).then((r) => r.budget),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["budgets"] }),
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/budgets/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["budgets"] }),
  });
}
