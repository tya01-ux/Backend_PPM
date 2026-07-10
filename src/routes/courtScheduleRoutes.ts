import { Router } from "express";
import {
  addCourtSchedule,
  getCourtSchedules,
  getCourtSchedule,
  updateCourtScheduleHandler,
  deleteCourtScheduleHandler,
  getTimeline,
} from "../controllers/courtschedulecontroller.js";
import { authenticate, checkAdmin } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/timeline", authenticate, checkAdmin, getTimeline);
router.get("/", authenticate, checkAdmin, getCourtSchedules);
router.get("/:id", authenticate, checkAdmin, getCourtSchedule);
router.post("/", authenticate, checkAdmin, addCourtSchedule);
router.put("/:id", authenticate, checkAdmin, updateCourtScheduleHandler);
router.delete("/:id", authenticate, checkAdmin, deleteCourtScheduleHandler);

export default router;