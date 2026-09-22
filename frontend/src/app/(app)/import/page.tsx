"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { CsvUploadDropzone } from "@/components/import/CsvUploadDropzone";
import { CsvPreviewTable } from "@/components/import/CsvPreviewTable";
import { useConfirmCsvImport, usePreviewCsv } from "@/hooks/useCsvImport";
import { CsvPreviewResult } from "@/schemas/csv-import.schema";

export default function ImportPage() {
  const [preview, setPreview] = useState<CsvPreviewResult | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const previewCsv = usePreviewCsv();
  const confirmImport = useConfirmCsvImport();

  async function handleFileSelected(file: File) {
    setResult(null);
    setPreview(null);
    try {
      const data = await previewCsv.mutateAsync(file);
      setPreview(data);
    } catch {
      setResult("Could not read the file");
    }
  }

  async function handleConfirm() {
    if (!preview) return;
    const rows = preview.validRows.map((r) => r.data!);
    try {
      const { imported } = await confirmImport.mutateAsync(rows);
      setResult(`Successfully imported ${imported} transactions.`);
      setPreview(null);
    } catch {
      setResult("Could not complete the import");
    }
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <div className="flex justify-between items-center mb-4">
            <h2 className="card-title">Import history (CSV)</h2>
            <a href="/api/import/template" className="btn btn-sm btn-outline gap-1.5">
              <Download size={14} />
              Download CSV template
            </a>
          </div>

          <CsvUploadDropzone onFileSelected={handleFileSelected} disabled={previewCsv.isPending} />

          {result && (
            <div role="alert" className="alert alert-info mt-4 text-sm">
              <span>{result}</span>
            </div>
          )}
        </div>
      </div>

      {preview && (
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
              <h3 className="font-semibold">
                Preview: {preview.validRows.length} valid, {preview.errorRows.length} with errors
              </h3>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleConfirm}
                disabled={confirmImport.isPending || preview.validRows.length === 0}
              >
                {confirmImport.isPending ? "Importing..." : `Confirm import (${preview.validRows.length})`}
              </button>
            </div>
            <CsvPreviewTable validRows={preview.validRows} errorRows={preview.errorRows} />
          </div>
        </div>
      )}
    </div>
  );
}
