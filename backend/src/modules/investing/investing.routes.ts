import { Router } from "express";
import { asyncHandler } from "../../lib/asyncHandler";
import { requireAuth } from "../../middleware/auth";
import { validateBody } from "../../middleware/validate";
import { updateSnapshotSchema, upsertSnapshotSchema } from "../../schemas/investing.schema";
import * as investingController from "./investing.controller";

export const investingRouter = Router();

investingRouter.use(requireAuth);

investingRouter.get("/summary", asyncHandler(investingController.summary));
investingRouter.get("/snapshots", asyncHandler(investingController.list));
investingRouter.post("/snapshots", validateBody(upsertSnapshotSchema), asyncHandler(investingController.upsert));
investingRouter.patch("/snapshots/:id", validateBody(updateSnapshotSchema), asyncHandler(investingController.update));
investingRouter.delete("/snapshots/:id", asyncHandler(investingController.remove));
