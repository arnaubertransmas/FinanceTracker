import { Router } from "express";
import { asyncHandler } from "../../lib/asyncHandler";
import { requireAuth } from "../../middleware/auth";
import { loginRateLimiter } from "../../middleware/rateLimiter";
import { validateBody } from "../../middleware/validate";
import { loginSchema } from "../../schemas/auth.schema";
import { login, logout, me } from "./auth.controller";

export const authRouter = Router();

authRouter.post("/login", loginRateLimiter, validateBody(loginSchema), asyncHandler(login));
authRouter.post("/logout", logout);
authRouter.get("/me", requireAuth, asyncHandler(me));
