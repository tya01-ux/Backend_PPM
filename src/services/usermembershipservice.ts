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