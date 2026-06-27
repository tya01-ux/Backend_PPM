import { Request, Response } from "express";
import {
  getAllPromos,
  createPromo,
  updatePromoById,
  deletePromoById,
  validatePromo,
} from "../services/promoService.js";

// GET ALL PROMOS
export const getPromos = async (_req: Request, res: Response) => {
  try {
    const promos = await getAllPromos();

    return res.status(200).json({
      data: promos,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Gagal mengambil data promo",
      error: error.message,
    });
  }
};

// CREATE PROMO
export const addPromo = async (req: Request, res: Response) => {
  try {
    const {
      code,
      discount,
      isPercent,
      maxDiscount,
      startDate,
      endDate,
    } = req.body;

    if (!code || discount === undefined || !startDate || !endDate) {
      return res.status(400).json({
        message: "code, discount, startDate, dan endDate wajib diisi",
      });
    }

    const promo = await createPromo({
      code,
      discount: Number(discount),
      isPercent: Boolean(isPercent),
      ...(maxDiscount !== undefined && {
        maxDiscount: Number(maxDiscount),
      }),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });

    return res.status(201).json({
      message: "Promo berhasil ditambahkan",
      data: promo,
    });
  } catch (error: any) {
    return res.status(400).json({
      message: error.message,
    });
  }
};


// UPDATE PROMO
export const updatePromo = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const promo = await updatePromoById(id, {
      ...req.body,
      ...(req.body.discount !== undefined && {
        discount: Number(req.body.discount),
      }),
      ...(req.body.startDate && {
        startDate: new Date(req.body.startDate),
      }),
      ...(req.body.endDate && {
        endDate: new Date(req.body.endDate),
      }),
    });

    return res.status(200).json({
      message: "Promo berhasil diupdate",
      data: promo,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Gagal mengupdate promo",
      error: error.message,
    });
  }
};

// DELETE PROMO
export const deletePromo = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    await deletePromoById(id);

    return res.status(200).json({
      message: "Promo berhasil dihapus",
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Gagal menghapus promo",
      error: error.message,
    });
  }
};

// VALIDATE PROMO
export const checkPromo = async (req: Request, res: Response) => {
  try {
    const { code, courtPrice } = req.body;

    if (!code || courtPrice === undefined) {
      return res.status(400).json({
        message: "code dan courtPrice wajib diisi",
      });
    }

    const result = await validatePromo(
      code,
      Number(courtPrice)
    );

    return res.status(200).json({
      data: result,
    });
  } catch (error: any) {
    return res.status(400).json({
      message: error.message,
    });
  }
};