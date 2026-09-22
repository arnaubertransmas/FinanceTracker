import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { prisma } from "../lib/prisma";

const AUTH_COOKIE_NAME = "ft_session";

export interface JwtPayload {
  userId: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export function signAuthToken(userId: string): string {
  return jwt.sign({ userId } satisfies JwtPayload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function setAuthCookie(res: Response, token: string) {
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

export function clearAuthCookie(res: Response) {
  res.clearCookie(AUTH_COOKIE_NAME, { path: "/" });
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[AUTH_COOKIE_NAME];
  if (!token) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired session" });
  }
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = await prisma.user.findUnique({ where: { id: req.userId! }, select: { role: true } });
  if (user?.role !== "ADMIN") {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  next();
}
