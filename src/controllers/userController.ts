import { Response } from "express";
import { CustomRequest } from "../middlewares/authMiddleware.js"; // Sesuaikan path ke file middleware kamu

export const getProfile = async (req: CustomRequest, res: Response) => {
  try {
    // Pastikan user sudah terautentikasi oleh middleware
    if (!req.user) {
      return res.status(401).json({ 
        message: "Unauthorized, data user tidak ditemukan" 
      });
    }

    // Mengembalikan data sesuai struktur isi token JWT kamu (userId dan email)
    return res.status(200).json({
      message: "Profile berhasil diambil",
      data: {
        id: req.user.userId,
        email: req.user.email,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Gagal mengambil profile",
      error: error.message,
    });
  }
};