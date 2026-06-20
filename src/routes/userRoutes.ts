import { Router } from "express";
import { getProfile } from "../controllers/userController.js";
import { authenticate } from "../middlewares/authMiddleware.js"; 

const router = Router();

router.get("/profile", authenticate, getProfile);

export default router;