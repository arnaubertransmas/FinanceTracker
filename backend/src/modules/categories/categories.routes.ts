import { Router } from "express";
import { asyncHandler } from "../../lib/asyncHandler";
import { requireAuth } from "../../middleware/auth";
import { validateBody } from "../../middleware/validate";
import { createCategorySchema, updateCategorySchema } from "../../schemas/category.schema";
import * as categoriesController from "./categories.controller";

export const categoriesRouter = Router();

categoriesRouter.use(requireAuth);

categoriesRouter.get("/", asyncHandler(categoriesController.list));
categoriesRouter.post("/", validateBody(createCategorySchema), asyncHandler(categoriesController.create));
categoriesRouter.patch("/:id", validateBody(updateCategorySchema), asyncHandler(categoriesController.update));
categoriesRouter.delete("/:id", asyncHandler(categoriesController.remove));
