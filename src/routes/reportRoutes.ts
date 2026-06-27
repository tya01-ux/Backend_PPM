import { Router } from "express";
import { revenueReport, bookingReport, membershipReport } from "../controllers/reportController.js";
import { authenticate, checkAdmin } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/revenue", authenticate, checkAdmin, revenueReport);
router.get("/booking", authenticate, checkAdmin, bookingReport);
router.get("/membership", authenticate, checkAdmin, membershipReport);

export default router;