import { Router } from "express";
import {
  getBookings,
  getBooking,
  addBooking,
  updateBookingHandler,
  cancelBookingHandler,
} from "../controllers/bookingController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", authenticate, getBookings);
router.get("/:id", authenticate, getBooking);
router.post("/", authenticate, addBooking);
router.put("/:id",authenticate, updateBookingHandler); 
router.put("/:id/cancel", authenticate, cancelBookingHandler);

export default router;