import { Request, Response } from "express";
import * as budgetsService from "./budgets.service";

export async function list(req: Request, res: Response) {
  const budgets = await budgetsService.listBudgets(req.userId!);
  res.json({ budgets });
}

export async function create(req: Request, res: Response) {
  const budget = await budgetsService.createBudget(req.userId!, req.body);
  res.status(201).json({ budget });
}

export async function update(req: Request, res: Response) {
  const budget = await budgetsService.updateBudget(req.userId!, req.params.id, req.body);
  res.json({ budget });
}

export async function remove(req: Request, res: Response) {
  await budgetsService.deleteBudget(req.userId!, req.params.id);
  res.status(204).send();
}

export async function progress(req: Request, res: Response) {
  const { month, year } = req.query as unknown as { month: number; year: number };
  const budgets = await budgetsService.getBudgetsWithProgress(req.userId!, Number(month), Number(year));
  res.json({ budgets });
}
