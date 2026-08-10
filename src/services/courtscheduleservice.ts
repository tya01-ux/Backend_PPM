import { prisma } from "../lib/db.js";
import { ScheduleType } from "@prisma/client";

// Cek bentrok waktu di lapangan yang sama — dipakai saat create & update
// biar admin ga bisa bikin 2 entry yang jam-nya tabrakan di lapangan yang sama.
const checkScheduleConflict = async (
  courtId: number,
  startAt: Date,
  endAt: Date,
  excludeScheduleId?: number
) => {
  const conflictingSchedule = await prisma.courtSchedule.findFirst({
    where: (() => {
      // build where object without assigning undefined to optional properties
      const where: any = {
        courtId,
        startAt: { lt: endAt },
        endAt: { gt: startAt },
      };
      if (excludeScheduleId !== undefined) where.id = { not: excludeScheduleId };
      return where;
    })(),
  });

  if (conflictingSchedule) {
    throw new Error(
      `CONFLICT: Jadwal bentrok dengan "${conflictingSchedule.title}" (${conflictingSchedule.startAt.toISOString()} - ${conflictingSchedule.endAt.toISOString()})`
    );
  }

  const conflictingBooking = await prisma.booking.findFirst({
    where: {
      courtId,
      status: { in: ["pending", "confirmed"] },
      startAt: { lt: endAt },
      endAt: { gt: startAt },
    },
  });

  if (conflictingBooking) {
    throw new Error(
      `CONFLICT: Jadwal bentrok dengan booking aktif "${conflictingBooking.bookingCode}"`
    );
  }
};

// CREATE — admin bikin entry maintenance/event/blocked
export const createCourtSchedule = async (data: {
  courtId: number;
  type: ScheduleType;
  title: string;
  notes?: string;
  startAt: Date;
  endAt: Date;
  createdById: number;
}) => {
  const court = await prisma.court.findUnique({ where: { id: data.courtId } });
  if (!court) {
    throw new Error("NOT_FOUND: Lapangan tidak ditemukan");
  }

  if (data.endAt <= data.startAt) {
    throw new Error("CONFLICT: Waktu selesai harus setelah waktu mulai");
  }

  await checkScheduleConflict(data.courtId, data.startAt, data.endAt);

  return await prisma.courtSchedule.create({
    data: {
      courtId: data.courtId,
      type: data.type,
      title: data.title,
      notes: data.notes ?? null,
      startAt: data.startAt,
      endAt: data.endAt,
      createdById: data.createdById,
    },
  });
};

// GET ALL (dengan filter opsional tanggal & lapangan)
export const getAllCourtSchedules = async (filters?: {
  date?: Date;
  courtId?: number;
}) => {
  const where: any = {};

  if (filters?.courtId) {
    where.courtId = filters.courtId;
  }

  if (filters?.date) {
    const startOfDay = new Date(filters.date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(filters.date);
    endOfDay.setHours(23, 59, 59, 999);

    where.startAt = { lte: endOfDay };
    where.endAt = { gte: startOfDay };
  }

  return await prisma.courtSchedule.findMany({
    where,
    include: { court: true, createdBy: { select: { id: true, name: true } } },
    orderBy: { startAt: "asc" },
  });
};

// GET BY ID
export const getCourtScheduleById = async (id: number) => {
  return await prisma.courtSchedule.findUnique({
    where: { id },
    include: { court: true, createdBy: { select: { id: true, name: true } } },
  });
};

// UPDATE
export const updateCourtSchedule = async (
  id: number,
  data: {
    type?: ScheduleType;
    title?: string;
    notes?: string;
    startAt?: Date;
    endAt?: Date;
  }
) => {
  const existing = await prisma.courtSchedule.findUnique({ where: { id } });
  if (!existing) {
    throw new Error("NOT_FOUND: Jadwal tidak ditemukan");
  }

  const newStartAt = data.startAt ?? existing.startAt;
  const newEndAt = data.endAt ?? existing.endAt;

  if (newEndAt <= newStartAt) {
    throw new Error("CONFLICT: Waktu selesai harus setelah waktu mulai");
  }

  if (data.startAt || data.endAt) {
    await checkScheduleConflict(existing.courtId, newStartAt, newEndAt, id);
  }

  return await prisma.courtSchedule.update({
    where: { id },
    data,
  });
};

// DELETE
export const deleteCourtSchedule = async (id: number) => {
  const existing = await prisma.courtSchedule.findUnique({ where: { id } });
  if (!existing) {
    throw new Error("NOT_FOUND: Jadwal tidak ditemukan");
  }

  return await prisma.courtSchedule.delete({ where: { id } });
};

// TIMELINE GABUNGAN — Booking + CourtSchedule, dipakai frontend buat render timeline
// Ini yang bikin frontend cuma perlu 1 kali fetch buat nampilin semua warna slot.
export const getCombinedTimeline = async (date: Date, courtId?: number) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const bookingWhere: any = {
    startAt: { lte: endOfDay },
    endAt: { gte: startOfDay },
    status: { not: "cancelled" },
  };
  if (courtId) bookingWhere.courtId = courtId;

  const scheduleWhere: any = {
    startAt: { lte: endOfDay },
    endAt: { gte: startOfDay },
  };
  if (courtId) scheduleWhere.courtId = courtId;

  const [bookings, schedules] = await Promise.all([
    prisma.booking.findMany({
      where: bookingWhere,
      include: { user: { select: { name: true } }, court: { select: { name: true } } },
      orderBy: { startAt: "asc" },
    }),
    prisma.courtSchedule.findMany({
      where: scheduleWhere,
      include: { court: { select: { name: true } } },
      orderBy: { startAt: "asc" },
    }),
  ]);

  // Mapping status booking ke status timeline (biar konsisten sama warna di frontend)
  const bookingEntries = bookings.map((b) => ({
    id: `booking-${b.id}`,
    courtId: b.courtId,
    courtName: b.court.name,
    startAt: b.startAt.toISOString(),
    endAt: b.endAt.toISOString(),
    status: b.status === "pending" ? "pending" : "booked",
    title: b.user.name,
    subtitle: "Booking",
  }));

  const scheduleEntries = schedules.map((s) => ({
    id: `schedule-${s.id}`,
    courtId: s.courtId,
    courtName: s.court.name,
    startAt: s.startAt.toISOString(),
    endAt: s.endAt.toISOString(),
    status: s.type, // "maintenance" | "event" | "blocked"
    title: s.title,
    subtitle: s.notes ?? undefined,
  }));

  return [...bookingEntries, ...scheduleEntries].sort(
    (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
  );
};