import { Router } from "express";
import { getCourts, getCourt, addCourt, updateCourt, deleteCourt } from "../controllers/courtController.js";
import { authenticate, checkAdmin } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", getCourts);
router.get("/:id", getCourt);
router.post("/", authenticate, checkAdmin, addCourt);
router.put("/:id", authenticate, checkAdmin, updateCourt);
router.delete("/:id", authenticate, checkAdmin, deleteCourt);

export default router;