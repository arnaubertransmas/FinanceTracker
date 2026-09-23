import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { InvestingSummary, PortfolioSnapshot } from "@/schemas/investing.schema";

function invalidate(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["investing"] });
}

export function useInvestingSummary() {
  return useQuery({
    queryKey: ["investing", "summary"],
    queryFn: () => api.get<InvestingSummary>("/investing/summary"),
  });
}

export function useSnapshots() {
  return useQuery({
    queryKey: ["investing", "snapshots"],
    queryFn: () => api.get<{ snapshots: PortfolioSnapshot[] }>("/investing/snapshots").then((r) => r.snapshots),
  });
}

export function useAddSnapshot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { date: string; value: number }) =>
      api.post<{ snapshot: PortfolioSnapshot }>("/investing/snapshots", input).then((r) => r.snapshot),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useUpdateSnapshot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, value }: { id: string; value: number }) =>
      api.patch<{ snapshot: PortfolioSnapshot }>(`/investing/snapshots/${id}`, { value }).then((r) => r.snapshot),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useDeleteSnapshot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/investing/snapshots/${id}`),
    onSuccess: () => invalidate(queryClient),
  });
}
