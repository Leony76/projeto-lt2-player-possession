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

router.get(
  "/get-to-home", 
  requireAuth,
  ContactController.getContactsFromHome,
);

router.get(
  "/get/:id", 
  requireAuth,
  ContactController.getContactDetails,
);

router.post(
  "/:id/add-contact-request", 
  requireAuth,
  ContactController.addContactRequest,
);

router.patch(
  "/:id/accept-contact-request", 
  requireAuth,
  ContactController.acceptContactRequest,
);

router.delete(
  "/:id/deny-contact-request", 
  requireAuth,
  ContactController.denyContactRequest,
);

router.delete(
  "/:id/cancel-contact-pending-request", 
  requireAuth,
  ContactController.cancelContactPendingRequest,
);

router.delete(
  "/:id/undo-contact-request", 
  requireAuth,
  ContactController.undoContactRequest,
);

export default router;