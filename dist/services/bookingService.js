import { prisma } from "../lib/db.js";
export const getAllBookings = async () => {
    return await prisma.booking.findMany({
        include: {
            user: true,
            court: true,
        },
    });
};
export const getBookingById = async (id) => {
    return await prisma.booking.findUnique({
        where: { id },
        include: {
            user: true,
            court: true,
        },
    });
};
export const createBooking = async (data) => {
    return await prisma.booking.create({
        data,
    });
};
export const updateBookingById = async (id, data) => {
    return await prisma.booking.update({
        where: { id },
        data,
    });
};
export const deleteBookingById = async (id) => {
    return await prisma.booking.delete({
        where: { id },
    });
};
//# sourceMappingURL=bookingService.js.map