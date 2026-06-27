import { Router } from "express";
import { getMemberships, getMembership, addMembership, updateMembership, deleteMembership } from "../controllers/membershipController.js";
import { authenticate, checkAdmin } from "../middlewares/authMiddleware.js";
const router = Router();
router.get("/", getMemberships);
router.get("/:id", getMembership);
router.post("/", authenticate, checkAdmin, addMembership);
router.put("/:id", authenticate, checkAdmin, updateMembership);
router.delete("/:id", authenticate, checkAdmin, deleteMembership);
export default router;
//# sourceMappingURL=membershipRoutes.js.map