import { Request, Response } from "express";
import * as investingService from "./investing.service";

export async function summary(req: Request, res: Response) {
  const data = await investingService.getInvestingSummary(req.userId!);
  res.json(data);
}

export async function list(req: Request, res: Response) {
  const snapshots = await investingService.listSnapshots(req.userId!);
  res.json({ snapshots });
}

export async function upsert(req: Request, res: Response) {
  const snapshot = await investingService.upsertSnapshot(req.userId!, req.body);
  res.status(201).json({ snapshot });
}

export async function update(req: Request, res: Response) {
  const snapshot = await investingService.updateSnapshot(req.userId!, req.params.id, req.body);
  res.json({ snapshot });
}

export async function remove(req: Request, res: Response) {
  await investingService.deleteSnapshot(req.userId!, req.params.id);
  res.status(204).send();
}
