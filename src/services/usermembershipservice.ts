import { prisma } from "../lib/db.js";

// GET ALL
export const getAllUserMemberships = async () => {
  return await prisma.userMembership.findMany({
    include: { user: true, membership: true },
    orderBy: { startDate: "desc" },
  });
};

// GET BY ID
export const getUserMembershipById = async (id: number) => {
  return await prisma.userMembership.findUnique({
    where: { id },
    include: { user: true, membership: true },
  });
};

// GET BY USER ID (riwayat membership milik satu user)
export const getUserMembershipsByUserId = async (userId: number) => {
  return await prisma.userMembership.findMany({
    where: { userId },
    include: { membership: true },
    orderBy: { startDate: "desc" },
  });
};

// CREATE (opsional, dipakai kalau admin mau input membership manual tanpa lewat registration)
export const createUserMembership = async (data: {
  userId: number;
  membershipId: number;
  startDate?: Date;
  endDate: Date;
}) => {
  const membership = await prisma.membership.findUnique({
    where: { id: data.membershipId },
  });

  if (!membership) {
    throw new Error("NOT_FOUND: Membership tidak ditemukan");
  }

  const user = await prisma.user.findUnique({
    where: { id: data.userId },
  });

  if (!user) {
    throw new Error("NOT_FOUND: User tidak ditemukan");
  }

  return await prisma.userMembership.create({
    data: {
      userId: data.userId,
      membershipId: data.membershipId,
      startDate: data.startDate ?? new Date(),
      endDate: data.endDate,
      status: "active",
    },
  });
};

// DELETE
export const deleteUserMembershipById = async (id: number) => {
  return await prisma.userMembership.delete({
    where: { id },
  });
};

const getFirstOccurrence = (startDate: Date, dayOfWeek: number): Date => {
  const d = new Date(startDate);
  d.setHours(0, 0, 0, 0);
  const diff = (dayOfWeek - d.getDay() + 7) % 7;
  d.setDate(d.getDate() + diff);
  return d;
};

const toDateKey = (d: Date) => d.toISOString().slice(0, 10);

export type WeeklyProgressEntry = {
  weekIndex: number;
  date: string; // "YYYY-MM-DD"
  status: "done" | "booked" | "missed" | "unbooked";
  bookingId?: number;
};

type MinimalUserMembership = {
  id: number;
  startDate: Date;
  endDate: Date;
  dayOfWeek: number | null;
};

type MinimalBooking = { id: number; startAt: Date; endAt: Date; status: string };

const buildWeeklyProgress = (
  userMembership: MinimalUserMembership,
  bookings: MinimalBooking[]
): WeeklyProgressEntry[] => {
  // Kalau jadwal tetapnya null (misal registrasi lama sebelum fix ini),
  // gak ada dasar buat hitung minggu — balikin array kosong daripada error.
  if (userMembership.dayOfWeek === null || userMembership.dayOfWeek === undefined) {
    return [];
  }

  const now = new Date();
  const progress: WeeklyProgressEntry[] = [];
  let occ = getFirstOccurrence(userMembership.startDate, userMembership.dayOfWeek);
  let weekIndex = 1;

  while (occ <= userMembership.endDate) {
    const occKey = toDateKey(occ);
    const matched = bookings.find((b) => toDateKey(b.startAt) === occKey);

    let status: WeeklyProgressEntry["status"];
    if (matched) {
      status = now > matched.endAt ? "done" : "booked";
    } else {
      status = occ < now ? "missed" : "unbooked";
    }

    const entry: WeeklyProgressEntry = {
      weekIndex,
      date: occKey,
      status,
      ...(matched ? { bookingId: matched.id } : {}),
    };

    progress.push(entry);

    occ = new Date(occ);
    occ.setDate(occ.getDate() + 7);
    weekIndex++;
  }

  return progress;
};

// Ambil membership AKTIF milik user + sessionsUsed & weeklyProgress yang
// dihitung ulang tiap kali di-fetch. Dipakai halaman Booking buat cek
// apakah "Gunakan Membership" bisa di-unlock.
export const getActiveUserMembershipByUserId = async (userId: number) => {
  const userMembership = await prisma.userMembership.findFirst({
    where: {
      userId,
      status: "active",
      endDate: { gte: new Date() },
    },
    include: { membership: true, court: true },
    orderBy: { startDate: "desc" },
  });

  if (!userMembership) return null;

  const bookings = await prisma.booking.findMany({
    where: {
      userMembershipId: userMembership.id,
      status: { not: "cancelled" },
    },
    select: { id: true, startAt: true, endAt: true, status: true },
    orderBy: { startAt: "asc" },
  });

  const weeklyProgress = buildWeeklyProgress(userMembership, bookings);
  const sessionsUsed = bookings.length;

  return {
    ...userMembership,
    sessionsUsed,
    weeklyProgress,
  };
};

// Detail satu UserMembership by id (sessionsUsed & weeklyProgress derived juga)
export const getUserMembershipDetail = async (id: number) => {
  const userMembership = await prisma.userMembership.findUnique({
    where: { id },
    include: { membership: true, court: true, user: true },
  });

  if (!userMembership) return null;

  const bookings = await prisma.booking.findMany({
    where: {
      userMembershipId: userMembership.id,
      status: { not: "cancelled" },
    },
    select: { id: true, startAt: true, endAt: true, status: true },
    orderBy: { startAt: "asc" },
  });

  const weeklyProgress = buildWeeklyProgress(userMembership, bookings);
  const sessionsUsed = bookings.length;

  return {
    ...userMembership,
    sessionsUsed,
    weeklyProgress,
  };
};