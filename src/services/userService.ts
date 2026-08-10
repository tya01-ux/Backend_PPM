import { prisma } from "../lib/db.js";
import bcrypt from "bcrypt";

// GET ALL USERS
export const getAllUsers = async () => {
  return await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
    },
    orderBy: {
      id: "asc",
    },
  });
};

// GET USER BY ID
export const getUserById = async (id: number) => {
  return await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
    },
  });
};

// UPDATE USER
export const updateUserById = async (
  id: number,
  data: {
    name?: string;
    email?: string;
    phone?: string;
    role?: string;
  }
) => {
  return await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
    },
  });
};

// DELETE USER
export const deleteUserById = async (id: number) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      role: true,
    },
  });

  if (!user) {
    throw new Error("User tidak ditemukan");
  }

  if (user.role.toLowerCase() === "admin") {
    throw new Error("Admin tidak boleh dihapus");
  }

  return await prisma.user.delete({
    where: { id },
  });
};

// CHANGE OWN PASSWORD
export const changeOwnPassword = async (
  id: number,
  oldPassword: string,
  newPassword: string
) => {
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    throw new Error("User tidak ditemukan");
  }

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    throw new Error("Password lama salah");
  }

  const hashedNewPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id },
    data: { password: hashedNewPassword },
  });

  return true;
};