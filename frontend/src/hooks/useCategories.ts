import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Category, CreateCategoryInput, TransactionType } from "@/schemas/category.schema";

const CATEGORIES_KEY = ["categories"] as const;

export function useCategories() {
  return useQuery({
    queryKey: CATEGORIES_KEY,
    queryFn: () => api.get<{ categories: Category[] }>("/categories").then((r) => r.categories),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCategoryInput) => api.post<{ category: Category }>("/categories", input).then((r) => r.category),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY }),
  });
}

export function useFindOrCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { nombre: string; tipo: TransactionType }) =>
      api.post<{ category: Category }>("/categories/find-or-create", input).then((r) => r.category),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY }),
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CreateCategoryInput> }) =>
      api.patch<{ category: Category }>(`/categories/${id}`, input).then((r) => r.category),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY }),
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/categories/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY }),
  });
}
