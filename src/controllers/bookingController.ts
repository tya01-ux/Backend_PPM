import { Response } from "express";
import {
  getAllBookings,
  getBookingById,
  createBooking,
  cancelBooking,
} from "../services/bookingService.js";

import { CustomRequest } from "../middlewares/authMiddleware.js";

export const getBookings = async (req: CustomRequest, res: Response) => {
  try {
    const bookings = await getAllBookings(req.user?.userId, req.user?.role);
    return res.json({ data: bookings });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const getBooking = async (req: CustomRequest, res: Response) => {
  try {
    const booking = await getBookingById(Number(req.params.id));
    if (!booking) return res.status(404).json({ message: "Booking tidak ditemukan" });

    // user hanya bisa lihat booking sendiri
    if (req.user?.role !== "admin" && booking.user.id !== req.user?.userId) {
      return res.status(403).json({ message: "Akses ditolak" });
    }

    return res.json({ data: booking });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const addBooking = async (req: CustomRequest, res: Response) => {
  try {
    const { startAt, endAt, courtId, notes } = req.body;

    if (!startAt || !endAt || !courtId) {
      return res.status(400).json({ message: "startAt, endAt, courtId wajib diisi" });
    }

    const booking = await createBooking({
      startAt: new Date(startAt),
      endAt: new Date(endAt),
      courtId: Number(courtId),
      userId: req.user!.userId,
      notes,
    });

    return res.status(201).json({ message: "Booking berhasil dibuat", data: booking });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const cancelBookingHandler = async (req: CustomRequest, res: Response) => {
  try {
    await cancelBooking(Number(req.params.id), req.user!.userId, req.user!.role!);
    return res.json({ message: "Booking berhasil dibatalkan" });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};