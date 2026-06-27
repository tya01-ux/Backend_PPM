import { Request, Response } from "express";
import {
    getAllBookings,
    getBookingById,
    createBooking,
    updateBookingById,
    deleteBookingById,
} from "../services/bookingService.js";

export const getBookings = async (
    req: Request,
    res: Response
) => {
    const bookings = await getAllBookings();

    res.json(bookings);
};

export const getBooking = async (
    req: Request,
    res: Response
) => {
    const id = Number(req.params.id);

    const booking = await getBookingById(id);

    res.json(booking);
};

export const addBooking = async (req: Request, res: Response) => {
    try {
        const { bookingDate, startTime, endTime, userId, courtId } = req.body;
        
        // Validasi dasar
        if (!bookingDate || !startTime || !endTime || !userId || !courtId) {
            return res.status(400).json({ message: "Semua field wajib diisi" });
        }

        const booking = await createBooking({
            ...req.body,
            bookingDate: new Date(bookingDate),
            userId: Number(userId),
            courtId: Number(courtId)
        });

        res.status(201).json({ message: "Booking berhasil dibuat", data: booking });
    } catch (error) {
        console.error("Error Backend:", error);
        res.status(500).json({ message: "Gagal membuat booking", error });
    }
};

export const updateBooking = async (
    req: Request,
    res: Response
) => {
    const id = Number(req.params.id);

    const booking = await updateBookingById(id, req.body);

    res.json({
        message: "Booking berhasil diupdate",
        data: booking,
    });
};

export const deleteBooking = async (
    req: Request,
    res: Response
) => {
    const id = Number(req.params.id);

    await deleteBookingById(id);

    res.json({
        message: "Booking berhasil dihapus",
    });
};