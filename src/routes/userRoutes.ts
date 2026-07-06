import { Router } from "express";
import {
  createUser,
  getUsers,
  updateUser,
  deleteUser,
  updateOwnProfile,
} from "../controllers/userController.js";
import { authenticate, checkAdmin } from "../middlewares/authMiddleware.js";

const router = Router();

router.put("/me", authenticate, updateOwnProfile);

router.get("/", authenticate, checkAdmin, getUsers);
router.post("/", authenticate, checkAdmin, createUser);
router.put("/:id", authenticate, checkAdmin, updateUser);
router.delete("/:id", authenticate, checkAdmin, deleteUser);

export default router;