import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { validate } from "@backend/middlewares/validate.middleware.js";
import { getContactsQuerySchema } from "@shared/schemas/contact.schema.js";
import { ContactController } from "./contact.controller.js";

const router = Router();

router.get(
  "/get", 
  requireAuth,
  validate(getContactsQuerySchema, "query"),
  ContactController.get,
);

export default router;