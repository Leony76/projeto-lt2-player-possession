import { Router } from "express";
import { AuthController } from "./auth.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { signInSchema, signUpRequestSchema } from '@shared/schemas/auth.schema.js';
import { validate } from "@backend/middlewares/validate.middleware.js";

const router = Router();

router.post(
  "/sign-up", 
  validate(signUpRequestSchema),
  AuthController.signUp,
);

router.post(
  "/sign-in", 
  validate(signInSchema),
  AuthController.signIn,
);

router.post(
  "/sign-out", 
  AuthController.signOut,
);

router.get(
  "/me", 
  requireAuth, AuthController.me,
);

export default router;