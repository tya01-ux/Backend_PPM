import { Response } from "express";
import { CustomRequest } from "../middlewares/authMiddleware.js";
import {
  getAllMembershipRegistrations,
  getMembershipRegistrationById,
  createMembershipRegistration,
  submitPaymentProof,
  moveToVerification,
  approveMembershipRegistration,
  rejectMembershipRegistration,
} from "../services/membershipregistrationservice.js";

const resolveErrorStatus = (message: string) => {
  if (message.startsWith("NOT_FOUND:")) {
    return { status: 404, message: message.replace("NOT_FOUND: ", "") };
  }
  if (message.startsWith("CONFLICT:")) {
    return { status: 409, message: message.replace("CONFLICT: ", "") };
  }
  return { status: 500, message };
};

// GET ALL (admin only — dipasang checkAdmin di route)
export const getMembershipRegistrations = async (_req: CustomRequest, res: Response) => {
  try {
    const registrations = await getAllMembershipRegistrations();
    return res.json({ data: registrations });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// GET BY ID — user cuma boleh liat punya sendiri, admin boleh liat semua
export const getMembershipRegistration = async (req: CustomRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID pendaftaran membership tidak valid" });
    }

    const registration = await getMembershipRegistrationById(id);
    if (!registration) {
      return res.status(404).json({ message: "Pendaftaran membership tidak ditemukan" });
    }

    const isOwner = registration.userId === req.user?.userId;
    const isAdmin = req.user?.role?.toLowerCase() === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Akses ditolak" });
    }

    return res.json({ data: registration });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// CREATE — userId dari token
export const addMembershipRegistration = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { membershipId, paymentMethod, paymentChannelId, proofImage, notes } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!membershipId) {
      return res.status(400).json({ message: "membershipId wajib diisi" });
    }

    const payload: any = {
      userId,
      membershipId: Number(membershipId),
      paymentMethod,
      proofImage,
      notes,
    };
    if (paymentChannelId !== undefined && paymentChannelId !== null && paymentChannelId !== "") {
      payload.paymentChannelId = Number(paymentChannelId);
    }

    const registration = await createMembershipRegistration(payload);

    return res.status(201).json({
      message: "Pendaftaran membership berhasil dibuat, menunggu approval",
      data: registration,
    });
  } catch (error: any) {
    const { status, message } = resolveErrorStatus(error.message);
    return res.status(status).json({ message });
  }
};

// USER upload bukti bayar
export const submitPaymentProofHandler = async (req: CustomRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { paymentMethod, paymentChannelId, proofImage } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({ message: "ID pendaftaran membership tidak valid" });
    }
    if (!proofImage) {
      return res.status(400).json({ message: "proofImage wajib diisi" });
    }

    const existing = await getMembershipRegistrationById(id);
    if (!existing) {
      return res.status(404).json({ message: "Pendaftaran membership tidak ditemukan" });
    }
    if (existing.userId !== req.user?.userId) {
      return res.status(403).json({ message: "Akses ditolak" });
    }

    const payload: any = {
      paymentMethod,
      proofImage,
    };
    if (paymentChannelId !== undefined && paymentChannelId !== null && paymentChannelId !== "") {
      payload.paymentChannelId = Number(paymentChannelId);
    }

    const registration = await submitPaymentProof(id, payload);

    return res.json({
      message: "Bukti pembayaran berhasil diunggah",
      data: registration,
    });
  } catch (error: any) {
    const { status, message } = resolveErrorStatus(error.message);
    return res.status(status).json({ message });
  }
};

// ADMIN: pending -> verification
export const moveToVerificationHandler = async (req: CustomRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID pendaftaran membership tidak valid" });
    }

    const registration = await moveToVerification(id);
    return res.json({
      message: "Pendaftaran membership dipindah ke verification",
      data: registration,
    });
  } catch (error: any) {
    const { status, message } = resolveErrorStatus(error.message);
    return res.status(status).json({ message });
  }
};

// ADMIN: approve
export const approveMembershipRegistrationHandler = async (req: CustomRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const approverId = req.user?.userId;

    if (isNaN(id)) {
      return res.status(400).json({ message: "ID pendaftaran membership tidak valid" });
    }
    if (!approverId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = await approveMembershipRegistration(id, approverId);
    return res.json({
      message: "Pendaftaran membership berhasil di-approve",
      data: result,
    });
  } catch (error: any) {
    const { status, message } = resolveErrorStatus(error.message);
    return res.status(status).json({ message });
  }
};

// ADMIN: reject (wajib reason)
export const rejectMembershipRegistrationHandler = async (req: CustomRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { reason } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({ message: "ID pendaftaran membership tidak valid" });
    }
    if (!reason || typeof reason !== "string") {
      return res.status(400).json({ message: "reason wajib diisi untuk reject pendaftaran" });
    }

    const registration = await rejectMembershipRegistration(id, reason);
    return res.json({
      message: "Pendaftaran membership berhasil di-reject",
      data: registration,
    });
  } catch (error: any) {
    const { status, message } = resolveErrorStatus(error.message);
    return res.status(status).json({ message });
  }
};