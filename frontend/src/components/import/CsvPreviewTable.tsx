"use client";

import { CsvRowResult } from "@/schemas/csv-import.schema";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function CsvPreviewTable({ validRows, errorRows }: { validRows: CsvRowResult[]; errorRows: CsvRowResult[] }) {
  const { t } = useLanguage();
  const allRows = [...validRows, ...errorRows].sort((a, b) => a.rowNumber - b.rowNumber);

  return (
    <div className="overflow-x-auto">
      <table className="table table-sm">
        <thead>
          <tr>
            <th>{t("csvImport.colRow")}</th>
            <th>{t("csvImport.colDate")}</th>
            <th>{t("csvImport.colType")}</th>
            <th>{t("csvImport.colCategory")}</th>
            <th>{t("csvImport.colAmount")}</th>
            <th>{t("csvImport.colDescription")}</th>
            <th>{t("csvImport.colStatus")}</th>
          </tr>
        </thead>
        <tbody>
          {allRows.map((row) => (
            <tr key={row.rowNumber} className={row.valid ? "" : "bg-error/10"}>
              <td>{row.rowNumber}</td>
              <td>{row.raw.date}</td>
              <td>{row.raw.type}</td>
              <td>{row.raw.category}</td>
              <td>{row.raw.amount}</td>
              <td>{row.raw.description}</td>
              <td>
                {row.valid ? (
                  <div className="flex gap-1 flex-wrap">
                    <span className="badge badge-success badge-sm">OK</span>
                    {row.categoryExists === false && (
                      <span className="badge badge-info badge-sm">{t("csvImport.newCategory")}</span>
                    )}
                  </div>
                ) : (
                  <span className="text-error text-xs">{row.errors?.join(", ")}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
