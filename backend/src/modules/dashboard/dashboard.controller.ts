import { Request, Response } from "express";
import { TransactionType } from "@prisma/client";
import * as dashboardService from "./dashboard.service";

export async function summary(req: Request, res: Response) {
  const { month, year } = req.query as unknown as { month?: number; year: number };
  const data = await dashboardService.getSummary(req.userId!, Number(year), month ? Number(month) : undefined);
  res.json(data);
}

export async function monthlyBreakdown(req: Request, res: Response) {
  const { year } = req.query as unknown as { year: number };
  const months = await dashboardService.getMonthlyBreakdown(req.userId!, Number(year));
  res.json({ months });
}

export async function categoryBreakdown(req: Request, res: Response) {
  const { month, year, type } = req.query as unknown as { month?: number; year: number; type?: TransactionType };
  const categories = await dashboardService.getCategoryBreakdown(
    req.userId!,
    Number(year),
    month ? Number(month) : undefined,
    type
  );
  res.json({ categories });
}

export async function availableYears(req: Request, res: Response) {
  const years = await dashboardService.getAvailableYears(req.userId!);
  res.json({ years });
}
