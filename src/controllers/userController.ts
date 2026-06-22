import { Request, Response } from "express";
import { prisma } from "../lib/db.js";
import bcrypt from "bcrypt"; // Jika menggunakan enkripsi password

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, role } = req.body;

    // Cek apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }

    // Berikan password default karena admin tidak menginput password secara manual di form FE
    const defaultPassword = "Password123!"; 
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        role: role || "user",
        password: hashedPassword, // Sesuaikan dengan field skema database kamu
      },
    });

    return res.status(201).json({
      message: "User berhasil dibuat",
      data: newUser,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Gagal membuat user baru",
      error: error.message,
    });
  }
};