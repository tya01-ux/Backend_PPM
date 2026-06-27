import { prisma } from "../lib/db.js";

// generate kode booking: PUMA-260525-00123
const generateBookingCode = (): string => {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yy = String(now.getFullYear()).slice(-2);
  const rand = Math.floor(Math.random() * 90000 + 10000);
  return `PUMA-${dd}${mm}${yy}-${rand}`;
};

// GET ALL
export const getAllBookings = async (userId?: number, role?: string) => {
  if (role !== "admin" && typeof userId === "undefined") {
    throw new Error("User ID dibutuhkan");
  }

  return await prisma.booking.findMany({
    where: role === "admin" ? {} : { userId: userId! },
    include: {
      user: {
        select: { id: true, name: true, email: true, phone: true },
      },
      court: {
        select: { id: true, name: true, type: true, image: true },
      },
      payment: {
        select: { status: true, totalAmount: true, expiredAt: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

// GET BOKING ID NYA
export const getBookingById = async (id: number) => {
  return await prisma.booking.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, name: true, email: true, phone: true },
      },
      court: true,
      payment: {
        include: {
          channel: true,
          proofs: true,
          promo: true,
        },
      },
    },
  });
};

// CRETAE BOOKING
export const createBooking = async (data: {
  startAt: Date;
  endAt: Date;
  notes?: string;
  userId: number;
  courtId: number;
}) => {
  const { startAt, endAt, notes, userId, courtId } = data;

  // hitung durasi dalam jam
  const duration = Math.round(
    (endAt.getTime() - startAt.getTime()) / (1000 * 60 * 60)
  );

  if (duration <= 0) throw new Error("Waktu tidak valid");

  // ambil harga court
  const court = await prisma.court.findUnique({ where: { id: courtId } });
  if (!court || !court.isActive) throw new Error("Lapangan tidak tersedia");

  // cek bentrok jadwal
  const conflict = await prisma.booking.findFirst({
    where: {
      courtId,
      status: { notIn: ["cancelled"] },
      AND: [{ startAt: { lt: endAt } }, { endAt: { gt: startAt } }],
    },
  });
  if (conflict) throw new Error("Jadwal lapangan sudah dibooking");

  const courtPrice = court.price * duration;
  const adminFee = 2500;
  const bookingCode = generateBookingCode();

  return await prisma.booking.create({
    data: {
      bookingCode,
      startAt,
      endAt,
      duration,
      courtPrice,
      notes: notes ?? null,
      userId,
      courtId,
      payment: {
        create: {
          courtPrice,
          adminFee,
          totalAmount: courtPrice + adminFee,
          expiredAt: new Date(Date.now() + 15 * 60 * 1000), // 15 menit
        },
      },
    },
    include: {
      court: true,
      payment: true,
    },
  });
};

// UPDATE BOOKING (admin only)
export const updateBooking = async (
  id: number,
  data: {
    courtId?: number;
    startAt?: Date;
    endAt?: Date;
    notes?: string;
    status?: "pending" | "confirmed" | "cancelled" | "completed";
  }
) => {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { payment: true },
  });

  if (!booking) throw new Error("Booking tidak ditemukan");

  // kalau ada perubahan waktu/court, recalculate harga
  if (data.startAt || data.endAt || data.courtId) {
    const startAt  = data.startAt  ?? booking.startAt;
    const endAt    = data.endAt    ?? booking.endAt;
    const courtId  = data.courtId  ?? booking.courtId;

    const duration = Math.round(
      (endAt.getTime() - startAt.getTime()) / (1000 * 60 * 60)
    );
    if (duration <= 0) throw new Error("Waktu tidak valid");

    const court = await prisma.court.findUnique({ where: { id: courtId } });
    if (!court || !court.isActive) throw new Error("Lapangan tidak tersedia");

    // cek bentrok, skip booking ini sendiri
    const conflict = await prisma.booking.findFirst({
      where: {
        courtId,
        id: { not: id },
        status: { notIn: ["cancelled"] },
        AND: [{ startAt: { lt: endAt } }, { endAt: { gt: startAt } }],
      },
    });
    if (conflict) throw new Error("Jadwal lapangan sudah dibooking");

    const courtPrice = court.price * duration;
    const adminFee   = booking.payment?.adminFee ?? 2500;
    const totalAmount = courtPrice + adminFee;

    // update booking + recalculate payment sekaligus
    return await prisma.$transaction([
      prisma.booking.update({
        where: { id },
        data: {
          courtId,
          startAt,
          endAt,
          duration,
          courtPrice,
          notes:  data.notes  ?? booking.notes,
          status: data.status ?? booking.status,
        },
      }),
      ...(booking.payment ? [
        prisma.payment.update({
          where: { bookingId: id },
          data: { courtPrice, totalAmount },
        }),
      ] : []),
    ]);
  }

  // kalau cuma update notes/status aja
  return await prisma.booking.update({
    where: { id },
    data: {
      ...(data.notes  !== undefined && { notes: data.notes }),
      ...(data.status !== undefined && { status: data.status }),
    },
  });
};

// CENCEL
export const cancelBooking = async (id: number, userId: number, role: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { payment: true },
  });

  if (!booking) throw new Error("Booking tidak ditemukan");
  if (booking.userId !== userId && role !== "admin")
    throw new Error("Akses ditolak");
  if (booking.status === "confirmed")
    throw new Error("Booking yang sudah dikonfirmasi tidak bisa dibatalkan");

  return await prisma.$transaction([
    prisma.booking.update({
      where: { id },
      data: { status: "cancelled" },
    }),
    ...(booking.payment
      ? [
          prisma.payment.update({
            where: { bookingId: id },
            data: { status: "expired" },
          }),
        ]
      : []),
  ]);
};