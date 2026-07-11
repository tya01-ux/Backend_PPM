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

// ✅ FIX: timeline dipakai juga di halaman booking publik (user biasa),
// jadi cukup authenticate (harus login), TANPA checkAdmin.
// checkAdmin cuma masuk akal untuk endpoint CRUD schedule (create/update/delete),
// yang memang cuma boleh dikerjakan admin.
router.get("/timeline", authenticate, getTimeline);

router.get("/", authenticate, checkAdmin, getCourtSchedules);
router.get("/:id", authenticate, checkAdmin, getCourtSchedule);
router.post("/", authenticate, checkAdmin, addCourtSchedule);
router.put("/:id", authenticate, checkAdmin, updateCourtScheduleHandler);
router.delete("/:id", authenticate, checkAdmin, deleteCourtScheduleHandler);

export default router;