import { Request, Response } from "express";
import {
  getAllUserMemberships,
  getUserMembershipById,
  getUserMembershipsByUserId,
  createUserMembership,
  deleteUserMembershipById,
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