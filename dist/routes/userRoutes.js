import { Router } from "express";
import { createUser, getUsers, updateUser, deleteUser } from "../controllers/userController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { checkAdmin } from "../middlewares/authMiddleware.js";
const router = Router();
router.get("/", authenticate, checkAdmin, getUsers);
router.post("/", authenticate, checkAdmin, createUser);
router.put("/:id", authenticate, checkAdmin, updateUser);
router.delete("/:id", authenticate, checkAdmin, deleteUser);
export default router;
//# sourceMappingURL=userRoutes.js.map