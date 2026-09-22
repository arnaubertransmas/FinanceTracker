import { Request, Response } from "express";
import { User } from "@prisma/client";
import { clearAuthCookie, setAuthCookie, signAuthToken } from "../../middleware/auth";
import { authenticateUser, getUserById } from "./auth.service";

function toPublicUser(user: User) {
  return { id: user.id, email: user.email, role: user.role };
}

export async function login(req: Request, res: Response) {
  const user = await authenticateUser(req.body);
  const token = signAuthToken(user.id);
  setAuthCookie(res, token);
  res.json({ user: toPublicUser(user) });
}

export function logout(_req: Request, res: Response) {
  clearAuthCookie(res);
  res.status(204).send();
}

export async function me(req: Request, res: Response) {
  const user = await getUserById(req.userId!);
  res.json({ user: toPublicUser(user) });
}
