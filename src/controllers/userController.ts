import { Request, Response } from "express";
import { prisma } from "../lib/db.js";
import bcrypt from "bcrypt";

// GET
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { id: "asc" } // Urutkan berdasarkan ID terkecil
    });
    return res.status(200).json({ data: users });
  } catch (error: any) {
    return res.status(500).json({ message: "Gagal memuat data user", error: error.message });
  }
};

// POST
export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, role, password } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }

    const passwordToHash = password || "Password123!"; 
    const hashedPassword = await bcrypt.hash(passwordToHash, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        role: role ? role.toLowerCase() : "user", 
        password: hashedPassword,
      },
    });

    return res.status(201).json({
      message: "User berhasil dibuat",
      data: newUser,
    });
  } catch (error: any) {
    return res.status(500).json({ message: "Gagal membuat user baru", error: error.message });
  }
};

// PUT
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        name,
        email,
        phone: phone || null,
        role: role ? role.toLowerCase() : undefined,
      },
    });

    return res.status(200).json({ message: "User berhasil diperbarui", data: updatedUser });
  } catch (error: any) {
    return res.status(500).json({ message: "Gagal memperbarui data user", error: error.message });
  }
};

// DELETE
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id: Number(id) } });
    return res.status(200).json({ message: "User berhasil dihapus" });
  } catch (error: any) {
    return res.status(500).json({ message: "Gagal menghapus user", error: error.message });
  }
};