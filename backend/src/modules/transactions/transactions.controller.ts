import { Request, Response } from "express";
import * as transactionsService from "./transactions.service";

export async function list(req: Request, res: Response) {
  const result = await transactionsService.listTransactions(req.userId!, req.query as never);
  res.json(result);
}

export async function create(req: Request, res: Response) {
  const transaction = await transactionsService.createTransaction(req.userId!, req.body);
  res.status(201).json({ transaction });
}

export async function update(req: Request, res: Response) {
  const transaction = await transactionsService.updateTransaction(req.userId!, req.params.id, req.body);
  res.json({ transaction });
}

export async function remove(req: Request, res: Response) {
  await transactionsService.deleteTransaction(req.userId!, req.params.id);
  res.status(204).send();
}
