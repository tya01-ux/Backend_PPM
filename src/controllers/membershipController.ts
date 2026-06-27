import { Request, Response } from "express";
import {
  getAllMemberships,
  getMembershipById,
  createMembership,
  updateMembershipById,
  deleteMembershipById,
} from "../services/membershipService.js";

// GET ALL MEMBERSHIPS
export const getMemberships = async (_req: Request, res: Response) => {
  try {
    const memberships = await getAllMemberships();

    return res.json({
      data: memberships,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// GET MEMBERSHIP BY ID
export const getMembership = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "ID membership tidak valid",
      });
    }

    const membership = await getMembershipById(id);

    if (!membership) {
      return res.status(404).json({
        message: "Membership tidak ditemukan",
      });
    }

    return res.json({
      data: membership,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// CREATE MEMBERSHIP
export const addMembership = async (req: Request, res: Response) => {
  try {
    const membership = await createMembership(req.body);

    return res.status(201).json({
      message: "Membership berhasil ditambahkan",
      data: membership,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// UPDATE MEMBERSHIP
export const updateMembership = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "ID membership tidak valid",
      });
    }

    const membership = await updateMembershipById(id, req.body);

    return res.json({
      message: "Membership berhasil diupdate",
      data: membership,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// DELETE MEMBERSHIP
export const deleteMembership = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "ID membership tidak valid",
      });
    }

    await deleteMembershipById(id);

    return res.json({
      message: "Membership berhasil dihapus",
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
    });
  }
};