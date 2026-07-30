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

export const autoExpireBookings = async () => {
  const now = new Date();

  const expiredPayments = await prisma.payment.findMany({
    where: {
      status: "pending",
      expiredAt: { lt: now },
    },
    select: { id: true, bookingId: true },
  });

  if (expiredPayments.length === 0) return;

  const paymentIds = expiredPayments.map((p) => p.id);
  const bookingIds = expiredPayments.map((p) => p.bookingId);

  await prisma.$transaction([
    prisma.payment.updateMany({
      where: { id: { in: paymentIds } },
      data: { status: "expired" },
    }),
    prisma.booking.updateMany({
      where: { id: { in: bookingIds } },
      data: { status: "cancelled" },
    }),
  ]);
};

const resolveDisplayStatus = (booking: {
  status: string;
  startAt: Date;
  endAt: Date;
}): string => {
  if (booking.status !== "confirmed") return booking.status;

  const now = new Date();
  if (now > booking.endAt) return "completed";
  if (now >= booking.startAt && now <= booking.endAt) return "ongoing";
  return "confirmed";
};

const withDisplayStatus = <T extends { status: string; startAt: Date; endAt: Date }>(
  booking: T
): T => ({
  ...booking,
  status: resolveDisplayStatus(booking) as T["status"],
});

// ✅ BARU — dipakai admin dashboard buat nampilin badge "MEMBER", pertemuan
// ke berapa, dan nama paket, di setiap row booking yang berasal dari
// membership (userMembershipId != null).
const BOOKING_MEMBERSHIP_INCLUDE = {
  userMembership: {
    include: { membership: true },
  },
} as const;

// GET ALL
export const getAllBookings = async (userId?: number, role?: string) => {
  if (role !== "admin" && typeof userId === "undefined") {
    throw new Error("User ID dibutuhkan");
  }

  await autoExpireBookings();

  const bookings = await prisma.booking.findMany({
    where: role === "admin" ? {} : { userId: userId! },
    include: {
      user: {
        select: { id: true, name: true, email: true, phone: true },
      },
      court: {
        select: { id: true, name: true, type: true, image: true },
      },
      payment: {
        include: {
          channel: true,
          proofs: true,
        },
      },
      ...BOOKING_MEMBERSHIP_INCLUDE,
    },
    orderBy: { createdAt: "desc" },
  });

  return bookings.map(withDisplayStatus);
};

// GET BOKING ID NYA
export const getBookingById = async (id: number) => {
  await autoExpireBookings();

  const booking = await prisma.booking.findUnique({
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
      ...BOOKING_MEMBERSHIP_INCLUDE,
    },
  });

  return booking ? withDisplayStatus(booking) : booking;
};

// GET SLOT YANG SUDAH TERISI (untuk cek ketersediaan booking)
export const getBookedSlots = async (courtId: number, date: string) => {
  await autoExpireBookings();

  const startOfDay = new Date(`${date}T00:00:00`);
  const endOfDay   = new Date(`${date}T23:59:59.999`);

  return await prisma.booking.findMany({
    where: {
      courtId,
      status: { notIn: ["cancelled"] },
      startAt: { gte: startOfDay, lte: endOfDay },
    },
    select: {
      startAt: true,
      endAt: true,
      status: true,
    },
    orderBy: { startAt: "asc" },
  });
};

// CRETAE BOOKING (reguler — bayar normal)
export const createBooking = async (data: {
  startAt: Date;
  endAt: Date;
  notes?: string;
  userId: number;
  courtId: number;
}) => {
  const { startAt, endAt, notes, userId, courtId } = data;

  const duration = Math.round(
    (endAt.getTime() - startAt.getTime()) / (1000 * 60 * 60)
  );

  if (duration <= 0) throw new Error("Waktu tidak valid");

  const court = await prisma.court.findUnique({ where: { id: courtId } });
  if (!court || !court.isActive) throw new Error("Lapangan tidak tersedia");

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
          expiredAt: new Date(Date.now() + 30 * 60 * 1000),
        },
      },
    },
    include: {
      court: true,
      payment: true,
    },
  });
};

// ✅ BARU — CREATE BOOKING VIA MEMBERSHIP (gratis, potong kuota, tanpa
// Payment). Dipanggil kalau user pilih "Gunakan Membership" di step Metode
// Booking. Sebelumnya fungsi ini SAMA SEKALI belum ada, jadi opsi membership
// walaupun ke-render di UI, gak punya jalur backend yang beneran motong
// kuota / bikin booking gratis — itu sebabnya "membership gak ngaruh".
export const createMembershipBooking = async (data: {
  startAt: Date;
  endAt: Date;
  notes?: string;
  userId: number;
  courtId: number;
}) => {
  const { startAt, endAt, notes, userId, courtId } = data;

  const duration = Math.round(
    (endAt.getTime() - startAt.getTime()) / (1000 * 60 * 60)
  );
  if (duration <= 0) throw new Error("Waktu tidak valid");

  const userMembership = await prisma.userMembership.findFirst({
    where: {
      userId,
      status: "active",
      endDate: { gte: new Date() },
    },
    orderBy: { startDate: "desc" },
  });

  if (!userMembership) {
    throw new Error("Kamu tidak punya membership aktif");
  }

  // Slot yang dipilih WAJIB persis sama dengan jadwal tetap membership:
  // lapangan, hari dalam minggu, dan jam mulai.
  if (userMembership.courtId !== courtId) {
    throw new Error("Lapangan tidak sesuai jadwal tetap membershipmu");
  }

  if (userMembership.dayOfWeek === null || startAt.getDay() !== userMembership.dayOfWeek) {
    throw new Error("Hari tidak sesuai jadwal tetap membershipmu");
  }

  const pad = (n: number) => String(n).padStart(2, "0");
  const requestedStart = `${pad(startAt.getHours())}:${pad(startAt.getMinutes())}`;
  if (userMembership.startTime !== requestedStart) {
    throw new Error("Jam tidak sesuai jadwal tetap membershipmu");
  }

  // ✅ Kuota dihitung ulang dari booking yang benar-benar ada (bukan counter
  // manual) — konsisten sama getActiveUserMembershipByUserId di
  // usermembershipservice.ts, biar gak ada celah "kepakai tapi gak kepotong".
  const bookingsUsed = await prisma.booking.count({
    where: {
      userMembershipId: userMembership.id,
      status: { not: "cancelled" },
    },
  });

  if (bookingsUsed >= userMembership.sessionsTotal) {
    throw new Error("Kuota membershipmu sudah habis bulan ini");
  }

  // Minggu ini belum boleh dipakai dua kali — cek udah ada booking di
  // tanggal yang sama dari membership ini.
  const dayStart = new Date(startAt);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const alreadyUsedThisWeek = await prisma.booking.findFirst({
    where: {
      userMembershipId: userMembership.id,
      status: { not: "cancelled" },
      startAt: { gte: dayStart, lt: dayEnd },
    },
  });

  if (alreadyUsedThisWeek) {
    throw new Error("Jadwal minggu ini sudah dipakai");
  }

  const court = await prisma.court.findUnique({ where: { id: courtId } });
  if (!court || !court.isActive) throw new Error("Lapangan tidak tersedia");

  // Slot fisik tetap harus kosong (jaga-jaga ada booking reguler/entry
  // maintenance lain yang nyerempet jam yang sama).
  const conflict = await prisma.booking.findFirst({
    where: {
      courtId,
      status: { notIn: ["cancelled"] },
      AND: [{ startAt: { lt: endAt } }, { endAt: { gt: startAt } }],
    },
  });
  if (conflict) throw new Error("Jadwal lapangan sudah dibooking");

  const bookingCode = generateBookingCode();

  return await prisma.booking.create({
    data: {
      bookingCode,
      startAt,
      endAt,
      duration,
      courtPrice: 0,
      notes: notes ?? null,
      userId,
      courtId,
      userMembershipId: userMembership.id,
      status: "confirmed", // langsung confirmed, gak lewat verifikasi admin — kuota udah dibayar di muka
    },
    include: {
      court: true,
      userMembership: { include: { membership: true } },
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

    // ✅ FIX: pakai $transaction dengan callback biar return objek tunggal
    // yang sudah include court, bukan array hasil transaksi
    return await prisma.$transaction(async (tx) => {
      const updatedBooking = await tx.booking.update({
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
        include: { court: true }, // ✅ wajib biar notifikasi bisa baca nama lapangan
      });

      if (booking.payment) {
        await tx.payment.update({
          where: { bookingId: id },
          data: { courtPrice, totalAmount },
        });
      }

      return updatedBooking;
    });
  }

  // kalau cuma update notes/status aja
  return await prisma.booking.update({
    where: { id },
    data: {
      ...(data.notes  !== undefined && { notes: data.notes }),
      ...(data.status !== undefined && { status: data.status }),
    },
    include: { court: true }, // ✅ tambahin ini juga
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