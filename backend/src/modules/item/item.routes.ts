import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { ItemController } from "./item.controller.js";
import { validate } from "@backend/middlewares/validate.middleware.js";
import { getItemsQuerySchema, updateUnitsSchema } from "@shared/schemas/item.schema.js";

const router = Router();

router.get(
  "/get", 
  requireAuth,
  validate(getItemsQuerySchema, "query"),
  ItemController.get,
);

router.get(
  "/get/:id", 
  requireAuth,
  ItemController.getItemDetails,
);

router.patch(
  "/:id/update-user-units", 
  requireAuth,
  validate(updateUnitsSchema),
  ItemController.updateUserItemUnits,
);

router.get(
  "/user/get-to-home", 
  requireAuth,
  ItemController.getUserItemsFromHome,
);

router.get(
  "/user/get", 
  requireAuth,
  validate(getItemsQuerySchema, "query"),
  ItemController.getUserItems,
);

export default router;