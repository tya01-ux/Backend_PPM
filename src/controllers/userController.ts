import { Request, Response } from "express";
import { prisma } from "../lib/db.js";
import bcrypt from "bcrypt";

// GET USERS
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
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

    return res.status(200).json({
      data: users,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Gagal memuat data user",
      error: error.message,
    });
  }
};

// CREATE USER
export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, role, password } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email sudah terdaftar",
      });
    }

    const hashedPassword = await bcrypt.hash(password || "Password123!", 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        role: role?.toLowerCase() || "user",
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
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

// UPDATE USER
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role } = req.body;

    const user = await prisma.user.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User tidak ditemukan",
      });
    }

    if (email) {
      const existingEmail = await prisma.user.findFirst({
        where: {
          email,
          NOT: {
            id: Number(id),
          },
        },
      });

      if (existingEmail) {
        return res.status(400).json({
          message: "Email sudah digunakan user lain",
        });
      }
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: Number(id),
      },
      data: {
        name,
        email,
        phone: phone || null,
        role: role?.toLowerCase(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    return res.status(200).json({
      message: "User berhasil diperbarui",
      data: updatedUser,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Gagal memperbarui data user",
      error: error.message,
    });
  }
};

// DELETE USER
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User tidak ditemukan",
      });
    }

    if (user.role === "admin") {
      return res.status(403).json({
        message: "Admin tidak boleh dihapus",
      });
    }

    await prisma.user.delete({
      where: {
        id: Number(id),
      },
    });

    return res.status(200).json({
      message: "User berhasil dihapus",
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Gagal menghapus user",
      error: error.message,
    });
  }
};