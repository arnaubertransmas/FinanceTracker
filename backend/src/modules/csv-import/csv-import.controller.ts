import { Request, Response } from "express";
import { HttpError } from "../../middleware/errorHandler";
import * as csvImportService from "./csv-import.service";

const TEMPLATE_CSV = [
  "date,type,category,amount,description",
  "2026-01-05,expense,Groceries,45.90,Weekly shop",
  "2026-01-01,income,Salary,2000,",
  "2026-01-10,investment,Savings plan,300,",
].join("\n");

export function downloadTemplate(_req: Request, res: Response) {
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="transactions-template.csv"`);
  res.send(TEMPLATE_CSV);
}

export async function preview(req: Request, res: Response) {
  if (!req.file) {
    throw new HttpError(400, "No file was uploaded");
  }
  const result = await csvImportService.previewCsv(req.userId!, req.file.buffer);
  res.json(result);
}

export async function confirm(req: Request, res: Response) {
  const imported = await csvImportService.confirmImport(req.userId!, req.body.rows);
  res.json({ imported });
}
