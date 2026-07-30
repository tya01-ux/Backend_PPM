import { Request, Response } from "express";
import { CustomRequest } from "../middlewares/authMiddleware.js";
import {
  getAllUserMemberships,
  getUserMembershipById,
  getUserMembershipsByUserId,
  createUserMembership,
  deleteUserMembershipById,
  getActiveUserMembershipByUserId,
  getUserMembershipDetail,
} from "../services/usermembershipservice.js";

// GET ALL USER MEMBERSHIPS
export const getUserMemberships = async (_req: Request, res: Response) => {
  try {
    const userMemberships = await getAllUserMemberships();

    return res.json({
      data: userMemberships,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// GET USER MEMBERSHIP BY ID
export const getUserMembership = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "ID user membership tidak valid",
      });
    }

    const userMembership = await getUserMembershipById(id);

    if (!userMembership) {
      return res.status(404).json({
        message: "User membership tidak ditemukan",
      });
    }

    return res.json({
      data: userMembership,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// GET USER MEMBERSHIPS BY USER ID
export const getUserMembershipByUser = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = Number(req.params.userId);

    if (isNaN(userId)) {
      return res.status(400).json({
        message: "userId tidak valid",
      });
    }

    const userMemberships = await getUserMembershipsByUserId(userId);

    return res.json({
      data: userMemberships,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// ✅ BARU — membership aktif milik user yang SEDANG LOGIN (dari token, bukan
// userId manual di URL). Ini yang dipanggil halaman Booking buat tau apakah
// opsi "Gunakan Membership" bisa di-unlock atau tidak, plus jadwal tetap +
// sisa kuotanya.
export const getMyActiveUserMembership = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userMembership = await getActiveUserMembershipByUserId(userId);

    // data: null artinya user belum/gak punya membership aktif — ini kondisi
    // valid (bukan error), frontend tinggal nampilin state "belum member".
    return res.json({ data: userMembership });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// ✅ BARU — detail satu UserMembership dengan sessionsUsed & weeklyProgress
// yang dihitung ulang (derived). User cuma boleh liat punya sendiri, admin
// boleh liat semua.
export const getUserMembershipDetailHandler = async (req: CustomRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID user membership tidak valid" });
    }

    const detail = await getUserMembershipDetail(id);
    if (!detail) {
      return res.status(404).json({ message: "User membership tidak ditemukan" });
    }

    const isOwner = detail.userId === req.user?.userId;
    const isAdmin = req.user?.role?.toLowerCase() === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Akses ditolak" });
    }

    return res.json({ data: detail });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// CREATE USER MEMBERSHIP (opsional, admin input langsung)
export const addUserMembership = async (req: Request, res: Response) => {
  try {
    const { userId, membershipId, startDate, endDate } = req.body;

    if (!userId || !membershipId || !endDate) {
      return res.status(400).json({
        message: "userId, membershipId, dan endDate wajib diisi",
      });
    }

    const userMembershipData: {
      userId: number;
      membershipId: number;
      startDate?: Date;
      endDate: Date;
    } = {
      userId: Number(userId),
      membershipId: Number(membershipId),
      endDate: new Date(endDate),
    };

    if (startDate) {
      userMembershipData.startDate = new Date(startDate);
    }

    const userMembership = await createUserMembership(userMembershipData);

    return res.status(201).json({
      message: "User membership berhasil ditambahkan",
      data: userMembership,
    });
  } catch (error: any) {
    if (typeof error.message === "string" && error.message.startsWith("NOT_FOUND:")) {
      return res.status(404).json({
        message: error.message.replace("NOT_FOUND: ", ""),
      });
    }
    return res.status(500).json({
      message: error.message,
    });
  }
};

// DELETE USER MEMBERSHIP
export const deleteUserMembership = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "ID user membership tidak valid",
      });
    }

    await deleteUserMembershipById(id);

    return res.json({
      message: "User membership berhasil dihapus",
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
    });
  }
};