import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { AdminUser } from "@/schemas/user.schema";

export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => api.get<{ users: AdminUser[] }>("/users").then((r) => r.users),
  });
}

export function useResetUserPassword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      api.patch<void>(`/users/${id}/password`, { password }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}
