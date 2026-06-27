import { prisma } from "../lib/db.js";
export const getPaymentChannels = async () => {
    return await prisma.paymentChannel.findMany({
        where: { isActive: true },
    });
};
export const choosePaymentChannel = async (bookingId, userId, role, paymentChannelId, promoCode) => {
    const payment = await prisma.payment.findUnique({
        where: { bookingId },
        include: { booking: true },
    });
    if (!payment)
        throw new Error("Payment tidak ditemukan");
    if (payment.booking.userId !== userId && role !== "admin")
        throw new Error("Akses ditolak");
    if (payment.status === "confirmed")
        throw new Error("Pembayaran sudah dikonfirmasi");
    let discount = 0;
    let promoId = null;
    if (promoCode) {
        const promo = await prisma.promo.findFirst({
            where: {
                code: promoCode,
                isActive: true,
                startDate: { lte: new Date() },
                endDate: { gte: new Date() },
            },
        });
        if (!promo)
            throw new Error("Kode promo tidak valid atau sudah kadaluarsa");
        discount = promo.isPercent
            ? Math.min(Math.round((payment.courtPrice * promo.discount) / 100), promo.maxDiscount ?? Infinity)
            : promo.discount;
        promoId = promo.id;
    }
    const totalAmount = payment.courtPrice + payment.adminFee - discount;
    return await prisma.payment.update({
        where: { bookingId },
        data: { paymentChannelId, promoId, discount, totalAmount },
        include: { channel: true, promo: true },
    });
};
export const uploadPaymentProof = async (bookingId, userId, role, filename) => {
    const payment = await prisma.payment.findUnique({
        where: { bookingId },
        include: { booking: true },
    });
    if (!payment)
        throw new Error("Payment tidak ditemukan");
    if (payment.booking.userId !== userId && role !== "admin")
        throw new Error("Akses ditolak");
    if (payment.status === "confirmed")
        throw new Error("Pembayaran sudah dikonfirmasi");
    if (payment.expiredAt && new Date() > payment.expiredAt) {
        await prisma.payment.update({
            where: { bookingId },
            data: { status: "expired" },
        });
        throw new Error("Waktu pembayaran sudah habis");
    }
    const imageUrl = `/uploads/${filename}`;
    await prisma.$transaction([
        prisma.paymentProof.create({
            data: { paymentId: payment.id, image: imageUrl },
        }),
        prisma.payment.update({
            where: { bookingId },
            data: { status: "uploaded", paidAt: new Date() },
        }),
    ]);
    return { message: "Bukti pembayaran berhasil diupload" };
};
export const confirmPayment = async (bookingId) => {
    const payment = await prisma.payment.findUnique({ where: { bookingId } });
    if (!payment)
        throw new Error("Payment tidak ditemukan");
    if (payment.status !== "uploaded")
        throw new Error("Belum ada bukti pembayaran yang diupload");
    await prisma.$transaction([
        prisma.payment.update({
            where: { bookingId },
            data: { status: "confirmed", confirmedAt: new Date() },
        }),
        prisma.booking.update({
            where: { id: bookingId },
            data: { status: "confirmed" },
        }),
    ]);
    return { message: "Pembayaran berhasil dikonfirmasi" };
};
export const rejectPayment = async (bookingId, note) => {
    const payment = await prisma.payment.findUnique({ where: { bookingId } });
    if (!payment)
        throw new Error("Payment tidak ditemukan");
    await prisma.payment.update({
        where: { bookingId },
        data: { status: "rejected", note },
    });
    return { message: "Pembayaran ditolak" };
};
export const getPaymentByBookingId = async (bookingId, userId, role) => {
    const payment = await prisma.payment.findUnique({
        where: { bookingId },
        include: {
            channel: true,
            proofs: true,
            promo: true,
            booking: {
                include: {
                    court: true,
                    user: { select: { id: true, name: true, email: true, phone: true } },
                },
            },
        },
    });
    if (!payment)
        throw new Error("Payment tidak ditemukan");
    if (payment.booking.userId !== userId && role !== "admin")
        throw new Error("Akses ditolak");
    return payment;
};
// ── ADMIN: kelola payment channel ──
export const createPaymentChannel = async (data) => {
    return await prisma.paymentChannel.create({ data });
};
export const updatePaymentChannel = async (id, data) => {
    return await prisma.paymentChannel.update({ where: { id }, data });
};
export const deletePaymentChannel = async (id) => {
    return await prisma.paymentChannel.update({
        where: { id },
        data: { isActive: false },
    });
};
//# sourceMappingURL=paymentService.js.map