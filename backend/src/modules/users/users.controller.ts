import { Request, Response } from "express";
import * as usersService from "./users.service";

export async function list(_req: Request, res: Response) {
  const users = await usersService.listUsers();
  res.json({ users });
}

export async function create(req: Request, res: Response) {
  const user = await usersService.createUser(req.body);
  res.status(201).json({ user });
}

export async function updateRole(req: Request, res: Response) {
  const user = await usersService.updateUserRole(req.userId!, req.params.id, req.body.role);
  res.json({ user });
}

export async function resetPassword(req: Request, res: Response) {
  await usersService.resetUserPassword(req.params.id, req.body);
  res.status(204).send();
}

export async function remove(req: Request, res: Response) {
  await usersService.deleteUser(req.userId!, req.params.id);
  res.status(204).send();
}
