import { Response } from "express";
import {
  getAllBookings,
  getBookingById,
  createBooking,
  createMembershipBooking,
  cancelBooking,
  updateBooking,
  getBookedSlots,
} from "../services/bookingService.js";
import { createNotification, notifyAllAdmins } from "../services/notificationservice.js";
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

// GET KETERSEDIAAN SLOT (availability)
export const getAvailabilityHandler = async (
  req: CustomRequest,
  res: Response
) => {
  try {
    const courtId = Number(req.query.courtId);
    const date = String(req.query.date || "");

    if (isNaN(courtId) || !date) {
      return res.status(400).json({
        message: "courtId dan date wajib diisi",
      });
    }

    const slots = await getBookedSlots(courtId, date);

    return res.json({ data: slots });
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
    const { startAt, endAt, courtId, notes, userId, useMembership } = req.body;

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

    const targetUserId =
      req.user?.role === "admin" && userId
        ? Number(userId)
        : req.user!.userId;

    // ✅ BARU — cabang ke booking via membership (gratis, potong kuota,
    // tanpa Payment) kalau user pilih "Gunakan Membership" di step Metode
    // Booking. Sebelumnya flag ini SAMA SEKALI gak dibaca dari body, jadi
    // request-nya diproses kayak booking reguler biasa (selalu bikin
    // Payment berbayar) walau frontend-nya kirim niat "pakai membership".
    const booking = useMembership
      ? await createMembershipBooking({
          startAt: new Date(startAt),
          endAt: new Date(endAt),
          courtId: courtIdNumber,
          userId: targetUserId,
          notes,
        })
      : await createBooking({
          startAt: new Date(startAt),
          endAt: new Date(endAt),
          courtId: courtIdNumber,
          userId: targetUserId,
          notes,
        });

    // ✅ FIX: notifikasi dibungkus try-catch TERPISAH.
    // Booking sudah SUKSES dibuat di baris atas — kalau notifikasi ke admin
    // gagal (misal field enum salah, atau tidak ada admin di DB), itu TIDAK
    // BOLEH bikin booking yang sudah tersimpan dianggap gagal oleh user.
    try {
      await notifyAllAdmins({
        title: useMembership ? "Booking Membership Baru" : "Booking Baru",
        message: useMembership
          ? "Ada booking baru dari jadwal tetap membership."
          : "Ada booking baru masuk yang perlu dikonfirmasi.",
        type: "booking_new",
        link: "/admin/booking",
      });
    } catch (notifError) {
      console.error("Gagal kirim notifikasi booking baru ke admin:", notifError);
    }

    return res.status(201).json({
      message: useMembership
        ? "Booking via membership berhasil dibuat"
        : "Booking berhasil dibuat",
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

    // ✅ FIX: notifikasi dibungkus try-catch TERPISAH. Update booking sudah
    // sukses di atas — kalau kirim notifikasi ke user gagal, admin tetap
    // harus dapat respons sukses (booking-nya memang sudah berubah statusnya).
    if (status && result?.userId) {
      try {
        const courtName = result.court?.name ?? "lapangan";

        if (status === "confirmed") {
          await createNotification({
            userId: result.userId,
            title: "Booking Dikonfirmasi",
            message: `Booking kamu untuk ${courtName} telah dikonfirmasi. Sampai jumpa di lapangan!`,
            type: "booking_confirmed",
            link: "/profile/riwayat-booking",
          });
        } else if (status === "cancelled") {
          await createNotification({
            userId: result.userId,
            title: "Booking Dibatalkan",
            message: `Booking kamu untuk ${courtName} telah dibatalkan.`,
            type: "booking_cancelled",
            link: "/profile/riwayat-booking",
          });
        } else if (status === "completed") {
          await createNotification({
            userId: result.userId,
            title: "Booking Selesai",
            message: `Terima kasih sudah bermain di ${courtName}! Sampai jumpa lagi.`,
            type: "booking_completed",
            link: "/profile/riwayat-booking",
          });
        }
      } catch (notifError) {
        console.error("Gagal kirim notifikasi perubahan status booking:", notifError);
      }
    }

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