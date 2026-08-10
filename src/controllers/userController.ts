import { Request, Response } from "express";
import { prisma } from "../lib/db.js";
import bcrypt from "bcrypt";

// ===================== GET USERS =====================
export const getUsers = async (_req: Request, res: Response) => {
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

// ===================== CREATE USER =====================
export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, role, password } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        message: "Nama dan email wajib diisi",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email sudah terdaftar",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password || "Password123!",
      10
    );

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

// ===================== UPDATE USER =====================
export const updateUser = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "ID tidak valid",
      });
    }

    const { name, email, phone, role } = req.body;

    const user = await prisma.user.findUnique({
      where: { id },
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
            id,
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
      where: { id },
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

// ===================== UPDATE OWN PROFILE =====================
export const updateOwnProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthenticated",
      });
    }

    const { name, email, phone } = req.body;

    if (email) {
      const existingEmail = await prisma.user.findFirst({
        where: {
          email,
          NOT: { id: userId },
        },
      });

      if (existingEmail) {
        return res.status(400).json({
          message: "Email sudah digunakan user lain",
        });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone !== undefined && { phone: phone || null }),
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
      message: "Profil berhasil diperbarui",
      data: updatedUser,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Gagal memperbarui profil",
      error: error.message,
    });
  }
};

// ===================== CHANGE OWN PASSWORD =====================
export const changeOwnPassword = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthenticated",
      });
    }

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        message: "Password lama dan password baru wajib diisi",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Password baru minimal 6 karakter",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        message: "User tidak ditemukan",
      });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Password lama salah",
      });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    return res.status(200).json({
      message: "Password berhasil diubah",
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Gagal mengubah password",
      error: error.message,
    });
  }
};

// ===================== DELETE USER =====================
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "ID tidak valid",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id },
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
      where: { id },
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