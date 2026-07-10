import { Router } from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import {
  getNotifications,
  readNotification,
  readAllNotifications,
} from "../controllers/notificationcontroller.js";

const router = Router();

router.get("/", authenticate, getNotifications);
router.patch("/:id/read", authenticate, readNotification);
router.patch("/read-all", authenticate, readAllNotifications);

export default router;

