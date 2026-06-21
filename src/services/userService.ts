import { prisma } from "../lib/db.js";

export const getAllUsers = async () => {
  return await prisma.user.findMany();
};

export const getUserById = async (id: number) => {
  return await prisma.user.findUnique({
    where: { id },
  });
};

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
  });
};

export const deleteUserById = async (id: number) => {
  return await prisma.user.delete({
    where: { id },
  });
};