import { Router } from "express";
import { asyncHandler } from "../../lib/asyncHandler";
import { requireAdmin, requireAuth } from "../../middleware/auth";
import { validateBody } from "../../middleware/validate";
import { resetPasswordSchema } from "../../schemas/user.schema";
import * as usersController from "./users.controller";

export const usersRouter = Router();

usersRouter.use(requireAuth, requireAdmin);

usersRouter.get("/", asyncHandler(usersController.list));
usersRouter.patch("/:id/password", validateBody(resetPasswordSchema), asyncHandler(usersController.resetPassword));
usersRouter.delete("/:id", asyncHandler(usersController.remove));
