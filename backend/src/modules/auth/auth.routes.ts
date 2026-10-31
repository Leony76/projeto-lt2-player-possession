import { Router } from "express";
import { AuthController } from "./auth.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";

const router = Router();

router.post("/sign-up"  , AuthController.signUp);
router.post("/sign-in"  , AuthController.signIn);
router.post("/sign-out" , AuthController.signOut);
router.get("/me"        , requireAuth, AuthController.me);

export default router;