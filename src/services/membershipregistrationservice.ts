import { prisma } from "../lib/db.js";
import { MembershipStatus, PaymentChannelType } from "@prisma/client";

export const validateMembershipSchedule = async (params: {
  courtId: number;
  dayOfWeek: number; // 0 = Minggu ... 6 = Sabtu
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  membershipId: number;
}) => {
  const { courtId, dayOfWeek, startTime, endTime, membershipId } = params;

  const membership = await prisma.membership.findUnique({
    where: { id: membershipId },
  });
  if (!membership) {
    throw new Error("NOT_FOUND: Membership tidak ditemukan");
  }

  const court = await prisma.court.findUnique({ where: { id: courtId } });
  if (!court || !court.isActive) {
    throw new Error("CONFLICT: Lapangan tidak tersedia");
  }

  const totalWeeks = Math.max(1, Math.ceil(membership.duration / 7));

  // Occurrence pertama dari dayOfWeek mulai HARI INI (bukan mundur ke masa lalu)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const firstOccurrence = new Date(today);
  const diff = (dayOfWeek - firstOccurrence.getDay() + 7) % 7;
  firstOccurrence.setDate(firstOccurrence.getDate() + diff);

  const [sh, sm] = startTime.split(":").map(Number) as [number, number];
  const [eh, em] = endTime.split(":").map(Number) as [number, number];

  const conflicts: { date: string; reason: string }[] = [];

  for (let i = 0; i < totalWeeks; i++) {
    const occDate = new Date(firstOccurrence);
    occDate.setDate(occDate.getDate() + i * 7);

    const slotStart = new Date(occDate);
    slotStart.setHours(sh, sm, 0, 0);

    const slotEnd = new Date(occDate);
    if (eh === 0 && em === 0) {
      // "00:00" berarti tengah malam hari berikutnya (venue buka lewat tengah malam)
      slotEnd.setDate(slotEnd.getDate() + 1);
      slotEnd.setHours(0, 0, 0, 0);
    } else {
      slotEnd.setHours(eh, em, 0, 0);
    }

    const bookingConflict = await prisma.booking.findFirst({
      where: {
        courtId,
        status: { notIn: ["cancelled"] },
        AND: [{ startAt: { lt: slotEnd } }, { endAt: { gt: slotStart } }],
      },
    });

    if (bookingConflict) {
      conflicts.push({
        date: slotStart.toISOString().slice(0, 10),
        reason: "Sudah ada booking di jam ini",
      });
      continue;
    }

    const scheduleConflict = await prisma.courtSchedule.findFirst({
      where: {
        courtId,
        AND: [{ startAt: { lt: slotEnd } }, { endAt: { gt: slotStart } }],
      },
    });

    if (scheduleConflict) {
      conflicts.push({
        date: slotStart.toISOString().slice(0, 10),
        reason: "Lapangan maintenance/event di jam ini",
      });
    }
  }

  return {
    available: conflicts.length === 0,
    totalWeeks,
    conflicts,
  };
};

// CREATE — user daftar membership, status awal selalu "pending"
export const createMembershipRegistration = async (data: {
  userId: number;
  membershipId: number;
  courtId?: number;
  dayOfWeek?: number;
  startTime?: string;
  endTime?: string;
  paymentMethod?: PaymentChannelType;
  paymentChannelId?: number;
  proofImage?: string;
  notes?: string;
}) => {
  const membership = await prisma.membership.findUnique({
    where: { id: data.membershipId },
  });

  if (!membership) {
    throw new Error("NOT_FOUND: Membership tidak ditemukan");
  }

  const existingActive = await prisma.membershipRegistration.findFirst({
    where: {
      userId: data.userId,
      membershipId: data.membershipId,
      status: { in: [MembershipStatus.pending, MembershipStatus.verification] },
    },
  });

  if (existingActive) {
    throw new Error(
      "CONFLICT: Kamu sudah punya pendaftaran membership ini yang masih diproses"
    );
  }

  const hasSchedule =
    data.courtId !== undefined ||
    data.dayOfWeek !== undefined ||
    data.startTime !== undefined ||
    data.endTime !== undefined;

  if (membership.requiresFixedSchedule) {
    // Paket fixed-schedule (Bronze/Silver/Gold) — jadwal WAJIB lengkap, tidak
    // boleh sebagian atau kosong sama sekali.
    if (
      data.courtId === undefined ||
      data.dayOfWeek === undefined ||
      !data.startTime ||
      !data.endTime
    ) {
      throw new Error(
        "CONFLICT: courtId, dayOfWeek, startTime, dan endTime harus diisi lengkap untuk paket ini"
      );
    }

    const scheduleCheck = await validateMembershipSchedule({
      courtId: data.courtId,
      dayOfWeek: data.dayOfWeek,
      startTime: data.startTime,
      endTime: data.endTime,
      membershipId: data.membershipId,
    });

    if (!scheduleCheck.available) {
      throw new Error(
        "CONFLICT: Jadwal yang dipilih bentrok di beberapa minggu ke depan, silakan pilih jadwal lain"
      );
    }
  } else if (hasSchedule) {
    // Paket flexible (Platinum) — user bebas pilih slot nanti lewat halaman
    // Booking, jadi jadwal tetap TIDAK BOLEH diisi saat registrasi.
    throw new Error(
      "CONFLICT: Paket ini tidak menggunakan jadwal tetap, silakan kosongkan pilihan jadwal"
    );
  }

  return await prisma.membershipRegistration.create({
    data: {
      userId: data.userId,
      membershipId: data.membershipId,
      courtId: membership.requiresFixedSchedule ? data.courtId ?? null : null,
      dayOfWeek: membership.requiresFixedSchedule ? data.dayOfWeek ?? null : null,
      startTime: membership.requiresFixedSchedule ? data.startTime ?? null : null,
      endTime: membership.requiresFixedSchedule ? data.endTime ?? null : null,
      paymentMethod: data.paymentMethod ?? null,
      paymentChannelId: data.paymentChannelId ?? null,
      proofImageUrl: data.proofImage ?? null,
      notes: data.notes ?? null,
      status: MembershipStatus.pending,
    },
  });
};

// GET ALL
export const getAllMembershipRegistrations = async () => {
  return await prisma.membershipRegistration.findMany({
    include: { user: true, membership: true, paymentChannel: true, approvedBy: true, court: true },
    orderBy: { createdAt: "desc" },
  });
};

// GET BY ID
export const getMembershipRegistrationById = async (id: number) => {
  return await prisma.membershipRegistration.findUnique({
    where: { id },
    include: { user: true, membership: true, paymentChannel: true, approvedBy: true, court: true },
  });
};

// USER upload / update bukti bayar — hanya boleh selagi masih "pending"
export const submitPaymentProof = async (
  id: number,
  data: { paymentMethod?: PaymentChannelType; paymentChannelId?: number; proofImage: string }
) => {
  const registration = await prisma.membershipRegistration.findUnique({
    where: { id },
  });

  if (!registration) {
    throw new Error("NOT_FOUND: Pendaftaran membership tidak ditemukan");
  }

  if (registration.status !== MembershipStatus.pending) {
    throw new Error(
      "CONFLICT: Bukti bayar hanya bisa diunggah selagi status masih pending"
    );
  }

  const updateData: {
    proofImageUrl: string;
    paymentMethod?: PaymentChannelType | null;
    paymentChannelId?: number | null;
  } = {
    proofImageUrl: data.proofImage,
  };

  if (data.paymentMethod !== undefined) {
    updateData.paymentMethod = data.paymentMethod;
  }

  if (data.paymentChannelId !== undefined) {
    updateData.paymentChannelId = data.paymentChannelId;
  }

  return await prisma.membershipRegistration.update({
    where: { id },
    data: updateData,
  });
};

// ADMIN: pending -> verification
export const moveToVerification = async (id: number) => {
  const registration = await prisma.membershipRegistration.findUnique({
    where: { id },
  });

  if (!registration) {
    throw new Error("NOT_FOUND: Pendaftaran membership tidak ditemukan");
  }

  if (registration.status !== MembershipStatus.pending) {
    throw new Error(
      "CONFLICT: Hanya pendaftaran berstatus pending yang bisa dipindah ke verification"
    );
  }

  if (!registration.proofImageUrl) {
    throw new Error(
      "CONFLICT: Belum ada bukti bayar yang diunggah untuk pendaftaran ini"
    );
  }

  return await prisma.membershipRegistration.update({
    where: { id },
    data: { status: MembershipStatus.verification },
  });
};

// ADMIN: verification -> active (otomatis bikin UserMembership + isi audit trail)
export const approveMembershipRegistration = async (
  id: number,
  approvedById: number
) => {
  return await prisma.$transaction(async (tx) => {
    const registration = await tx.membershipRegistration.findUnique({
      where: { id },
      include: { membership: true },
    });

    if (!registration) {
      throw new Error("NOT_FOUND: Pendaftaran membership tidak ditemukan");
    }

    if (registration.status !== MembershipStatus.verification) {
      throw new Error(
        "CONFLICT: Hanya pendaftaran berstatus verification yang bisa di-approve"
      );
    }

    const approver = await tx.user.findUnique({ where: { id: approvedById } });
    if (!approver) {
      throw new Error("NOT_FOUND: Admin approver tidak ditemukan");
    }

    const updatedRegistration = await tx.membershipRegistration.update({
      where: { id },
      data: {
        status: MembershipStatus.active,
        approvedById,
        approvedAt: new Date(),
      },
      include: { membership: true }, // ✅ wajib biar notifikasi bisa baca nama paket
    });

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + registration.membership.duration);

    const userMembership = await tx.userMembership.create({
      data: {
        userId: registration.userId,
        membershipId: registration.membershipId,
        startDate,
        endDate,
        courtId: registration.courtId,
        dayOfWeek: registration.dayOfWeek,
        startTime: registration.startTime,
        endTime: registration.endTime,
        sessionsTotal: registration.membership.sessionsPerMonth,
        sessionsUsed: 0, // hanya nilai awal — selalu dihitung ulang secara derived saat di-fetch
      },
    });

    return { registration: updatedRegistration, userMembership };
  });
};

// ADMIN: pending atau verification -> rejected (wajib reason)
export const rejectMembershipRegistration = async (id: number, reason: string) => {
  const registration = await prisma.membershipRegistration.findUnique({
    where: { id },
  });

  if (!registration) {
    throw new Error("NOT_FOUND: Pendaftaran membership tidak ditemukan");
  }

  if (
    registration.status !== MembershipStatus.pending &&
    registration.status !== MembershipStatus.verification
  ) {
    throw new Error(
      "CONFLICT: Pendaftaran ini sudah final (active/rejected), tidak bisa direject lagi"
    );
  }

  return await prisma.membershipRegistration.update({
    where: { id },
    data: {
      status: MembershipStatus.rejected,
      rejectedAt: new Date(),
      rejectReason: reason,
    },
    include: { membership: true }, 
  });
};