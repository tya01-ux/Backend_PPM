import { prisma } from "../lib/db.js";

export const getAllBookings = async () => {
    return await prisma.booking.findMany({
        include: {
            user: true,
            court: true,
        },
    });
};

export const getBookingById = async (id: number) => {
    return await prisma.booking.findUnique({
        where: { id },
        include: {
            user: true,
            court: true,
        },
    });
};

export const createBooking = async (data: {
    bookingDate: Date;
    startTime: string;
    endTime: string;
    userId: number;
    courtId: number;
}) => {
    return await prisma.booking.create({
        data,
    });
};

export const updateBookingById = async (
    id: number,
    data: {
        bookingDate?: Date;
        startTime?: string;
        endTime?: string;
        status?: "pending" | "confirmed" | "cancelled" | "completed";
        userId?: number;
        courtId?: number;
    }
) => {
    return await prisma.booking.update({
        where: { id },
        data,
    });
};

export const deleteBookingById = async (id: number) => {
    return await prisma.booking.delete({
        where: { id },
    });
};