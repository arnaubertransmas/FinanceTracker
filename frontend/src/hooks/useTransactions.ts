import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { CreateTransactionInput, Transaction, TransactionListResult, UpdateTransactionInput } from "@/schemas/transaction.schema";

export interface TransactionFilters {
  type?: string;
  categoryId?: string;
  from?: string;
  to?: string;
  search?: string;
  page?: number;
}

function buildQuery(filters: TransactionFilters) {
  const params = new URLSearchParams();
  if (filters.type) params.set("type", filters.type);
  if (filters.categoryId) params.set("categoryId", filters.categoryId);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (filters.search) params.set("search", filters.search);
  if (filters.page) params.set("page", String(filters.page));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

function transactionsKey(filters: TransactionFilters) {
  return ["transactions", filters] as const;
}

function invalidateAffected(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["transactions"] });
  queryClient.invalidateQueries({ queryKey: ["budgets"] });
  queryClient.invalidateQueries({ queryKey: ["dashboard"] });
}

export function useTransactions(filters: TransactionFilters = {}) {
  return useQuery({
    queryKey: transactionsKey(filters),
    queryFn: () => api.get<TransactionListResult>(`/transactions${buildQuery(filters)}`),
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTransactionInput) =>
      api.post<{ transaction: Transaction }>("/transactions", input).then((r) => r.transaction),
    onSuccess: () => invalidateAffected(queryClient),
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTransactionInput }) =>
      api.patch<{ transaction: Transaction }>(`/transactions/${id}`, input).then((r) => r.transaction),
    onSuccess: () => invalidateAffected(queryClient),
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/transactions/${id}`),
    onSuccess: () => invalidateAffected(queryClient),
  });
}
