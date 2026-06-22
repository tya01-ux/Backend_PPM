import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/db.js";

export interface CustomRequest extends Request {
  user?: {
    userId: number;
    email?: string;
  };
}

export const authenticate = (req: CustomRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthenticated, format tidak valid" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token tidak ditemukan" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret_key") as { userId: number; email?: string };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid token atau token kadaluarsa" });
  }
};

// PERBAIKAN MIDDLEWARE CHECK ADMIN: Ambil role langsung dari database menggunakan userId hasil decode token
export const checkAdmin = async (req: CustomRequest, res: Response, next: NextFunction) => {
  const userPayload = req.user;

  if (!userPayload) {
    return res.status(401).json({ message: "Unauthorized. Anda belum login" });
  }

  try {
    // Cari data user di database untuk memastikan role aslinya adalah admin
    const dbUser = await prisma.user.findUnique({
      where: { id: userPayload.userId }
    });

    if (!dbUser || dbUser.role.toLowerCase() !== "admin") {
      return res.status(403).json({ message: "Forbidden: Akses ditolak, khusus Admin!" });
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: "Terjadi kesalahan pada validasi admin" });
  }
};