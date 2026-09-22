import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { CsvPreviewResult, CsvRowData } from "@/schemas/csv-import.schema";

export function usePreviewCsv() {
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return api.postForm<CsvPreviewResult>("/import/preview", formData);
    },
  });
}

export function useConfirmCsvImport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (rows: CsvRowData[]) => api.post<{ imported: number }>("/import/confirm", { rows }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
