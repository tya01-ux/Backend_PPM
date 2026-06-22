import { Router } from "express";
import { createUser, getUsers, updateUser, deleteUser } from "../controllers/userController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", authenticate, getUsers);       
router.post("/", authenticate, createUser);     
router.put("/:id", authenticate, updateUser);   
router.delete("/:id", authenticate, deleteUser); 

export default router;