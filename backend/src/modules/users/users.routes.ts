import { Router } from "express";
import { asyncHandler } from "../../lib/asyncHandler";
import { requireAdmin, requireAuth } from "../../middleware/auth";
import { validateBody } from "../../middleware/validate";
import { createUserSchema, resetPasswordSchema, updateRoleSchema } from "../../schemas/user.schema";
import * as usersController from "./users.controller";

export const usersRouter = Router();

usersRouter.use(requireAuth, requireAdmin);

usersRouter.get("/", asyncHandler(usersController.list));
usersRouter.post("/", validateBody(createUserSchema), asyncHandler(usersController.create));
usersRouter.patch("/:id/password", validateBody(resetPasswordSchema), asyncHandler(usersController.resetPassword));
usersRouter.patch("/:id/role", validateBody(updateRoleSchema), asyncHandler(usersController.updateRole));
usersRouter.delete("/:id", asyncHandler(usersController.remove));
