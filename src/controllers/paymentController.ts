import { Response } from "express";
import { CustomRequest } from "../middlewares/authMiddleware.js";
import {
  getPaymentChannels,
  choosePaymentChannel,
  uploadPaymentProof,
  confirmPayment,
  rejectPayment,
  getPaymentByBookingId,
  createPaymentChannel,
  updatePaymentChannel,
  deletePaymentChannel,
} from "../services/paymentService.js";

type PaymentRequestWithFile = CustomRequest & {
  file?: {
    filename: string;
  };
};

// ======================
// GET PAYMENT CHANNELS
// ======================
export const getChannels = async (_req: CustomRequest, res: Response) => {
  try {
    const channels = await getPaymentChannels();

    return res.status(200).json({
      data: channels,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Gagal mengambil daftar metode pembayaran",
      error: error.message,
    });
  }
};

// ======================
// GET PAYMENT DETAIL
// ======================
export const getPayment = async (req: CustomRequest, res: Response) => {
  try {
    const bookingId = Number(req.params.bookingId);

    const payment = await getPaymentByBookingId(
      bookingId,
      req.user!.userId,
      req.user!.role!
    );

    return res.status(200).json({
      data: payment,
    });
  } catch (error: any) {
    return res.status(403).json({
      message: error.message,
    });
  }
};

// ======================
// CHOOSE PAYMENT CHANNEL
// ======================
export const chooseChannel = async (
  req: CustomRequest,
  res: Response
) => {
  try {
    const { paymentChannelId, promoCode } = req.body;

    if (!paymentChannelId) {
      return res.status(400).json({
        message: "paymentChannelId wajib diisi",
      });
    }

    const payment = await choosePaymentChannel(
      Number(req.params.bookingId),
      req.user!.userId,
      req.user!.role!,
      Number(paymentChannelId),
      promoCode
    );

    return res.status(200).json({
      message: "Metode pembayaran berhasil dipilih",
      data: payment,
    });
  } catch (error: any) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

// ======================
// UPLOAD PAYMENT PROOF
// ======================
export const uploadProof = async (
  req: PaymentRequestWithFile,
  res: Response
) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "File bukti pembayaran wajib diupload",
      });
    }

    const result = await uploadPaymentProof(
      Number(req.params.bookingId),
      req.user!.userId,
      req.user!.role!,
      req.file.filename
    );

    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

// ======================
// CONFIRM PAYMENT (ADMIN)
// ======================
export const confirm = async (
  req: CustomRequest,
  res: Response
) => {
  try {
    const result = await confirmPayment(Number(req.params.bookingId));

    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

// ======================
// REJECT PAYMENT (ADMIN)
// ======================
export const reject = async (
  req: CustomRequest,
  res: Response
) => {
  try {
    const { note } = req.body;

    if (!note) {
      return res.status(400).json({
        message: "Note wajib diisi",
      });
    }

    const result = await rejectPayment(
      Number(req.params.bookingId),
      note
    );

    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

// ======================
// CREATE PAYMENT CHANNEL
// ======================
export const addChannel = async (
  req: PaymentRequestWithFile,
  res: Response
) => {
  try {
    const {
      name,
      type,
      accountNumber,
      accountName,
    } = req.body;

    if (!name || !type) {
      return res.status(400).json({
        message: "name dan type wajib diisi",
      });
    }

    const qrImage = req.file
      ? `/uploads/${req.file.filename}`
      : req.body.qrImage;

    const channel = await createPaymentChannel({
      name,
      type,
      accountNumber,
      accountName,
      qrImage,
    });

    return res.status(201).json({
      message: "Channel pembayaran berhasil ditambahkan",
      data: channel,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Gagal menambahkan channel pembayaran",
      error: error.message,
    });
  }
};

// ======================
// UPDATE PAYMENT CHANNEL
// ======================
export const editChannel = async (
  req: PaymentRequestWithFile,
  res: Response
) => {
  try {
    const qrImage = req.file
      ? `/uploads/${req.file.filename}`
      : req.body.qrImage;

    const channel = await updatePaymentChannel(
      Number(req.params.id),
      {
        ...req.body,
        ...(qrImage && { qrImage }),
      }
    );

    return res.status(200).json({
      message: "Channel pembayaran berhasil diupdate",
      data: channel,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Gagal mengupdate channel pembayaran",
      error: error.message,
    });
  }
};

// ======================
// DELETE PAYMENT CHANNEL
// ======================
export const removeChannel = async (
  req: CustomRequest,
  res: Response
) => {
  try {
    await deletePaymentChannel(Number(req.params.id));

    return res.status(200).json({
      message: "Channel pembayaran berhasil dinonaktifkan",
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Gagal menghapus channel pembayaran",
      error: error.message,
    });
  }
};