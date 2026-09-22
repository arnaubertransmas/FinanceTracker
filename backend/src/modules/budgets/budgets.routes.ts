import { Router } from "express";
import { asyncHandler } from "../../lib/asyncHandler";
import { requireAuth } from "../../middleware/auth";
import { validateBody, validateQuery } from "../../middleware/validate";
import { budgetQuerySchema, createBudgetSchema, updateBudgetSchema } from "../../schemas/budget.schema";
import * as budgetsController from "./budgets.controller";

export const budgetsRouter = Router();

budgetsRouter.use(requireAuth);

budgetsRouter.get("/progress", validateQuery(budgetQuerySchema), asyncHandler(budgetsController.progress));
budgetsRouter.get("/", asyncHandler(budgetsController.list));
budgetsRouter.post("/", validateBody(createBudgetSchema), asyncHandler(budgetsController.create));
budgetsRouter.patch("/:id", validateBody(updateBudgetSchema), asyncHandler(budgetsController.update));
budgetsRouter.delete("/:id", asyncHandler(budgetsController.remove));
