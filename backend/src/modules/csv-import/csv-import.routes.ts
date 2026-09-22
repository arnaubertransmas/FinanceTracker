import { Router } from "express";
import multer from "multer";
import { asyncHandler } from "../../lib/asyncHandler";
import { requireAuth } from "../../middleware/auth";
import { validateBody } from "../../middleware/validate";
import { confirmImportSchema } from "../../schemas/csv-import.schema";
import * as csvImportController from "./csv-import.controller";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

export const csvImportRouter = Router();

csvImportRouter.get("/template", csvImportController.downloadTemplate);

csvImportRouter.use(requireAuth);

csvImportRouter.post("/preview", upload.single("file"), asyncHandler(csvImportController.preview));
csvImportRouter.post("/confirm", validateBody(confirmImportSchema), asyncHandler(csvImportController.confirm));
