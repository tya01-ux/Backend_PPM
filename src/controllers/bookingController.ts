import { Response } from "express";
import {
  getAllBookings,
  getBookingById,
  createBooking,
  cancelBooking,
  updateBooking,
} from "../services/bookingService.js";
import { CustomRequest } from "../middlewares/authMiddleware.js";

// GET ALL BOOKINGS
export const getBookings = async (req: CustomRequest, res: Response) => {
  try {
    const bookings = await getAllBookings(req.user?.userId, req.user?.role);

    return res.json({
      data: bookings,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// GET BOOKING BY ID
export const getBooking = async (req: CustomRequest, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "ID booking tidak valid",
      });
    }

    const booking = await getBookingById(id);

    if (!booking) {
      return res.status(404).json({
        message: "Booking tidak ditemukan",
      });
    }

    // User hanya boleh melihat booking miliknya sendiri
    if (
      req.user?.role !== "admin" &&
      booking.user.id !== req.user?.userId
    ) {
      return res.status(403).json({
        message: "Akses ditolak",
      });
    }

    return res.json({
      data: booking,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// CREATE BOOKING
export const addBooking = async (req: CustomRequest, res: Response) => {
  try {
    const { startAt, endAt, courtId, notes, userId } = req.body;

    if (!startAt || !endAt || !courtId) {
      return res.status(400).json({
        message: "startAt, endAt, dan courtId wajib diisi",
      });
    }

    const courtIdNumber = Number(courtId);

    if (isNaN(courtIdNumber)) {
      return res.status(400).json({
        message: "courtId tidak valid",
      });
    }

    // Admin boleh membuat booking atas nama user lain
    const targetUserId =
      req.user?.role === "admin" && userId
        ? Number(userId)
        : req.user!.userId;

    const booking = await createBooking({
      startAt: new Date(startAt),
      endAt: new Date(endAt),
      courtId: courtIdNumber,
      userId: targetUserId,
      notes,
    });

    return res.status(201).json({
      message: "Booking berhasil dibuat",
      data: booking,
    });
  } catch (error: any) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

// UPDATE BOOKING (admin only)
export const updateBookingHandler = async (
  req: CustomRequest,
  res: Response
) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID booking tidak valid" });
    }

    // hanya admin yang boleh update
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Hanya admin yang bisa mengubah booking" });
    }

    const { courtId, startAt, endAt, notes, status } = req.body;

    const result = await updateBooking(id, {
      ...(courtId  && { courtId:  Number(courtId) }),
      ...(startAt  && { startAt:  new Date(startAt) }),
      ...(endAt    && { endAt:    new Date(endAt) }),
      ...(notes    !== undefined && { notes }),
      ...(status   && { status }),
    });

    return res.json({
      message: "Booking berhasil diupdate",
      data: result,
    });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

// CANCEL BOOKING
export const cancelBookingHandler = async (
  req: CustomRequest,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "ID booking tidak valid",
      });
    }

    await cancelBooking(
      id,
      req.user!.userId,
      req.user!.role!
    );

    return res.json({
      message: "Booking berhasil dibatalkan",
    });
  } catch (error: any) {
    return res.status(400).json({
      message: error.message,
    });
  }
};