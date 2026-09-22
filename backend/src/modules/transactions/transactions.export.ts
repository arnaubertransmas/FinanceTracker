import Papa from "papaparse";
import { Request, Response } from "express";
import { toDateOnlyString } from "../../lib/dates";
import { listTransactionsForExport } from "./transactions.service";

export async function exportTransactionsCsv(req: Request, res: Response) {
  const { from, to } = req.query as { from?: string; to?: string };
  const transactions = await listTransactionsForExport(req.userId!, from, to);

  const rows = transactions.map((t) => ({
    date: toDateOnlyString(t.date),
    type: t.type,
    category: t.category.nombre,
    amount: t.amount.toString(),
    description: t.description ?? "",
  }));

  const csv = Papa.unparse(rows, {
    columns: ["date", "type", "category", "amount", "description"],
  });

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="transactions.csv"`);
  res.send(csv);
}
