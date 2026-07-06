import { Request, Response } from "express";
import {
  getAllMembershipRegistrations,
  getMembershipRegistrationById,
  createMembershipRegistration,
  approveMembershipRegistration,
  rejectMembershipRegistration,
} from "../services/membershipregistrationservice.js";

// Helper: service melempar error dengan prefix "NOT_FOUND:" / "CONFLICT:"
// supaya controller bisa mapping ke status code yang tepat.
const resolveErrorStatus = (message: string) => {
  if (message.startsWith("NOT_FOUND:")) {
    return { status: 404, message: message.replace("NOT_FOUND: ", "") };
  }
  if (message.startsWith("CONFLICT:")) {
    return { status: 409, message: message.replace("CONFLICT: ", "") };
  }
  return { status: 500, message };
};

// GET ALL MEMBERSHIP REGISTRATIONS
export const getMembershipRegistrations = async (
  _req: Request,
  res: Response
) => {
  try {
    const registrations = await getAllMembershipRegistrations();

    return res.json({
      data: registrations,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// GET MEMBERSHIP REGISTRATION BY ID
export const getMembershipRegistration = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "ID pendaftaran membership tidak valid",
      });
    }

    const registration = await getMembershipRegistrationById(id);

    if (!registration) {
      return res.status(404).json({
        message: "Pendaftaran membership tidak ditemukan",
      });
    }

    return res.json({
      data: registration,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// CREATE MEMBERSHIP REGISTRATION (user daftar)
export const addMembershipRegistration = async (
  req: Request,
  res: Response
) => {
  try {
    const { userId, membershipId } = req.body;

    if (!userId || !membershipId) {
      return res.status(400).json({
        message: "userId dan membershipId wajib diisi",
      });
    }

    const registration = await createMembershipRegistration({
      userId: Number(userId),
      membershipId: Number(membershipId),
    });

    return res.status(201).json({
      message: "Pendaftaran membership berhasil dibuat, menunggu approval",
      data: registration,
    });
  } catch (error: any) {
    const { status, message } = resolveErrorStatus(error.message);
    return res.status(status).json({ message });
  }
};

// APPROVE MEMBERSHIP REGISTRATION
export const approveMembershipRegistrationHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "ID pendaftaran membership tidak valid",
      });
    }

    const result = await approveMembershipRegistration(id);

    return res.json({
      message: "Pendaftaran membership berhasil di-approve",
      data: result,
    });
  } catch (error: any) {
    const { status, message } = resolveErrorStatus(error.message);
    return res.status(status).json({ message });
  }
};

// REJECT MEMBERSHIP REGISTRATION
export const rejectMembershipRegistrationHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "ID pendaftaran membership tidak valid",
      });
    }

    const registration = await rejectMembershipRegistration(id);

    return res.json({
      message: "Pendaftaran membership berhasil di-reject",
      data: registration,
    });
  } catch (error: any) {
    const { status, message } = resolveErrorStatus(error.message);
    return res.status(status).json({ message });
  }
};