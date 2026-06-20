import { getAllBookings, getBookingById, createBooking, updateBookingById, deleteBookingById, } from "../services/bookingService.js";
export const getBookings = async (req, res) => {
    const bookings = await getAllBookings();
    res.json(bookings);
};
export const getBooking = async (req, res) => {
    const id = Number(req.params.id);
    const booking = await getBookingById(id);
    res.json(booking);
};
export const addBooking = async (req, res) => {
    const booking = await createBooking(req.body);
    res.status(201).json({
        message: "Booking berhasil dibuat",
        data: booking,
    });
};
export const updateBooking = async (req, res) => {
    const id = Number(req.params.id);
    const booking = await updateBookingById(id, req.body);
    res.json({
        message: "Booking berhasil diupdate",
        data: booking,
    });
};
export const deleteBooking = async (req, res) => {
    const id = Number(req.params.id);
    await deleteBookingById(id);
    res.json({
        message: "Booking berhasil dihapus",
    });
};
//# sourceMappingURL=bookingController.js.map