import { Request, Response } from "express";
import * as categoriesService from "./categories.service";

export async function list(req: Request, res: Response) {
  const categories = await categoriesService.listCategories(req.userId!);
  res.json({ categories });
}

export async function create(req: Request, res: Response) {
  const category = await categoriesService.createCategory(req.userId!, req.body);
  res.status(201).json({ category });
}

export async function findOrCreate(req: Request, res: Response) {
  const category = await categoriesService.findOrCreateCategory(req.userId!, req.body);
  res.status(201).json({ category });
}

export async function update(req: Request, res: Response) {
  const category = await categoriesService.updateCategory(req.userId!, req.params.id, req.body);
  res.json({ category });
}

export async function remove(req: Request, res: Response) {
  await categoriesService.deleteCategory(req.userId!, req.params.id);
  res.status(204).send();
}
