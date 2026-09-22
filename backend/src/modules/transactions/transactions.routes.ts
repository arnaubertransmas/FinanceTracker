import { Router } from "express";
import { asyncHandler } from "../../lib/asyncHandler";
import { requireAuth } from "../../middleware/auth";
import { validateBody, validateQuery } from "../../middleware/validate";
import { createTransactionSchema, listTransactionsQuerySchema, updateTransactionSchema } from "../../schemas/transaction.schema";
import * as transactionsController from "./transactions.controller";
import { exportTransactionsCsv } from "./transactions.export";

export const transactionsRouter = Router();

transactionsRouter.use(requireAuth);

transactionsRouter.get("/export", asyncHandler(exportTransactionsCsv));
transactionsRouter.get("/", validateQuery(listTransactionsQuerySchema), asyncHandler(transactionsController.list));
transactionsRouter.post("/", validateBody(createTransactionSchema), asyncHandler(transactionsController.create));
transactionsRouter.patch("/:id", validateBody(updateTransactionSchema), asyncHandler(transactionsController.update));
transactionsRouter.delete("/:id", asyncHandler(transactionsController.remove));
