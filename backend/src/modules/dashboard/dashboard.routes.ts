import { Router } from "express";
import { asyncHandler } from "../../lib/asyncHandler";
import { requireAuth } from "../../middleware/auth";
import { validateQuery } from "../../middleware/validate";
import { categoryBreakdownQuerySchema, periodQuerySchema, yearQuerySchema } from "../../schemas/dashboard.schema";
import * as dashboardController from "./dashboard.controller";

export const dashboardRouter = Router();

dashboardRouter.use(requireAuth);

dashboardRouter.get("/summary", validateQuery(periodQuerySchema), asyncHandler(dashboardController.summary));
dashboardRouter.get(
  "/monthly-breakdown",
  validateQuery(yearQuerySchema),
  asyncHandler(dashboardController.monthlyBreakdown)
);
dashboardRouter.get(
  "/category-breakdown",
  validateQuery(categoryBreakdownQuerySchema),
  asyncHandler(dashboardController.categoryBreakdown)
);
dashboardRouter.get("/available-years", asyncHandler(dashboardController.availableYears));
