import { Request, Response } from "express";
import {
  getAllPromos,
  createPromo,
  updatePromoById,
  deletePromoById,
  validatePromo,
} from "../services/promoService.js";

export const getPromos = async (req: Request, res: Response) => {
  try {
    const promos = await getAllPromos();
    return res.json({ data: promos });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const addPromo = async (req: Request, res: Response) => {
  try {
    const { code, discount, isPercent, maxDiscount, startDate, endDate } = req.body;
    if (!code || !discount || !startDate || !endDate) {
      return res.status(400).json({ message: "code, discount, startDate, endDate wajib diisi" });
    }

    const promo = await createPromo({
      code,
      discount: Number(discount),
      isPercent: Boolean(isPercent),
      ...(maxDiscount !== undefined ? { maxDiscount: Number(maxDiscount) } : {}),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });

    return res.status(201).json({ message: "Promo berhasil dibuat", data: promo });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const updatePromo = async (req: Request, res: Response) => {
  try {
    const promo = await updatePromoById(Number(req.params.id), {
      ...req.body,
      ...(req.body.discount && { discount: Number(req.body.discount) }),
      ...(req.body.startDate && { startDate: new Date(req.body.startDate) }),
      ...(req.body.endDate && { endDate: new Date(req.body.endDate) }),
    });
    return res.json({ message: "Promo berhasil diupdate", data: promo });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const deletePromo = async (req: Request, res: Response) => {
  try {
    await deletePromoById(Number(req.params.id));
    return res.json({ message: "Promo berhasil dihapus" });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const checkPromo = async (req: Request, res: Response) => {
  try {
    const { code, courtPrice } = req.body;
    if (!code || !courtPrice) {
      return res.status(400).json({ message: "code dan courtPrice wajib diisi" });
    }

    const result = await validatePromo(code, Number(courtPrice));
    return res.json({ data: result });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};