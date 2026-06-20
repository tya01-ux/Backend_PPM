import { Router } from "express";
import {
    getBookings,
    getBooking,
    addBooking,
    updateBooking,
    deleteBooking,
} from "../controllers/bookingController.js";

const router = Router();

router.get("/", getBookings);
router.get("/:id", getBooking);
router.post("/", addBooking);
router.put("/:id", updateBooking);
router.delete("/:id", deleteBooking);

export default router;