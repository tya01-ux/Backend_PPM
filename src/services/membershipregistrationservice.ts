import { prisma } from "../lib/db.js";
import { MembershipStatus, PaymentChannelType } from "@prisma/client";

// CREATE — user daftar membership, status awal selalu "pending"
export const createMembershipRegistration = async (data: {
  userId: number;
  membershipId: number;
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

  return await prisma.membershipRegistration.create({
    data: {
      userId: data.userId,
      membershipId: data.membershipId,
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
    include: { user: true, membership: true, paymentChannel: true, approvedBy: true },
    orderBy: { createdAt: "desc" },
  });
};

// GET BY ID
export const getMembershipRegistrationById = async (id: number) => {
  return await prisma.membershipRegistration.findUnique({
    where: { id },
    include: { user: true, membership: true, paymentChannel: true, approvedBy: true },
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
  });
};