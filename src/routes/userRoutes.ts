import { Router } from "express";
import { createUser } from "../controllers/userController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = Router();

// Endpoint ini akan menjadi POST /api/users ketika di-mount di server.js
router.post("/", authenticate, createUser); 

export default router;