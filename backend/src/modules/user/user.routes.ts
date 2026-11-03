import { Router } from "express";
import { UserController } from "./user.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { uploadImage } from "../../middlewares/uploadImage.middleware.js";

const router = Router();

router.patch(
  "/profile/update-image", 
  requireAuth,
  uploadImage.single("image"),
  UserController.editProfileImage,
);

export default router;