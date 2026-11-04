import { Router } from "express";
import { UserController } from "./user.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { uploadImage } from "../../middlewares/uploadImage.middleware.js";
import { validate } from "@backend/middlewares/validate.middleware.js";
import { lumberBucksSchema, newPasswordSchema, passwordSchema, usernameSchema } from "@shared/schemas/editProfileInfos.schema.js";

const router = Router();

router.patch(
  "/profile/update-image", 
  requireAuth,
  uploadImage.single("image"),
  UserController.editProfileImage,
);

router.post(
  "/profile/edit-username/verify-availability", 
  requireAuth,
  validate(usernameSchema),
  UserController.verifyUsernameAvailability,
);

router.patch(
  "/profile/edit-username", 
  requireAuth,
  validate(usernameSchema),
  UserController.editUsername,
);

router.patch(
  "/profile/edit-lumber-bucks", 
  requireAuth,
  validate(lumberBucksSchema),
  UserController.editLumberBucks,
);

router.post(
  "/profile/edit-password/verification", 
  requireAuth,
  validate(passwordSchema),
  UserController.passwordVerificationBeforeEdit,
);

router.patch(
  "/profile/edit-password", 
  requireAuth,
  validate(newPasswordSchema),
  UserController.editPassword,
);

export default router;