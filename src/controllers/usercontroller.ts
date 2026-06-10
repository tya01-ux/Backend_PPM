import { Request, Response } from "express";
import { prisma } from "../lib/db.js";
import bcrypt from "bcrypt";

// GET ALL USERS
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        foto: true,
        createdAt: true,
      },
      orderBy: {
        id: "desc",
      },
    }); 

    return res.json(users);
  } catch (error) {
    return res.status(500).json({
      message: "Gagal mengambil data user",
      error,
    });
  }
};

// ==========================
// GET USER BY ID
// ==========================
export const showUser = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        foto: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User tidak ditemukan",
      });
    }

    return res.json(user);
  } catch (error) {
    return res.status(500).json({
      message: "Gagal mengambil detail user",
      error,
    });
  }
};

// ==========================
// CREATE USER
// ==========================
export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, foto } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Nama, email, dan password wajib diisi",
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

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        foto:
          foto ||
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
      },
    });

    return res.status(201).json({
      message: "User berhasil ditambahkan",
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        foto: newUser.foto,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Gagal membuat user",
      error,
    });
  }
};

// ==========================
// UPDATE USER
// ==========================
export const updateUser = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return res.status(404).json({
        message: "User tidak ditemukan",
      });
    }

    const { name, email, password, foto } = req.body;

    // cek email jika diganti
    if (email && email !== existingUser.email) {
      const emailCheck = await prisma.user.findUnique({
        where: { email },
      });

      if (emailCheck) {
        return res.status(400).json({
          message: "Email sudah digunakan user lain",
        });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name: name ?? existingUser.name,
        email: email ?? existingUser.email,
        password: password
          ? await bcrypt.hash(password, 10)
          : existingUser.password,
        foto: foto ?? existingUser.foto,
      },
    });

    return res.json({
      message: "User berhasil diperbarui",
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        foto: updatedUser.foto,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Gagal memperbarui user",
      error,
    });
  }
};

// ==========================
// DELETE USER
// ==========================
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return res.status(404).json({
        message: "User tidak ditemukan",
      });
    }

    await prisma.user.delete({
      where: { id },
    });

    return res.json({
      message: "User berhasil dihapus",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Gagal menghapus user",
      error,
    });
  }
};