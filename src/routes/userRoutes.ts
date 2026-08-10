import { Router } from "express";
import {
  createUser,
  getUsers,
  updateUser,
  deleteUser,
  updateOwnProfile,
  changeOwnPassword,
} from "../controllers/userController.js";
import { authenticate, checkAdmin } from "../middlewares/authMiddleware.js";

const router = Router();

router.put("/me", authenticate, updateOwnProfile);
router.put("/me/password", authenticate, changeOwnPassword);

router.get("/", authenticate, checkAdmin, getUsers);
router.post("/", authenticate, checkAdmin, createUser);
router.put("/:id", authenticate, checkAdmin, updateUser);
router.delete("/:id", authenticate, checkAdmin, deleteUser);

export default router;