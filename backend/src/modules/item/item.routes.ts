import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { validate } from "@backend/middlewares/validate.middleware.js";
import { ItemController } from "./item.controller.js";

const router = Router();

router.get(
  "/get", 
  requireAuth,
  ItemController.get,
);

export default router;