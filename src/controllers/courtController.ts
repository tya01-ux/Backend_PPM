import { Request, Response } from "express";
import {
  getAllCourts,
  getCourtById,
  createCourt,
  updateCourtById,
  deleteCourtById,
} from "../services/courtService.js";

// GET ALL COURTS
export const getCourts = async (_req: Request, res: Response) => {
  try {
    const courts = await getAllCourts();

    return res.status(200).json({
      data: courts,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Gagal mengambil data lapangan",
      error: error.message,
    });
  }
};

// GET COURT BY ID
export const getCourt = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const court = await getCourtById(id);

    if (!court) {
      return res.status(404).json({
        message: "Lapangan tidak ditemukan",
      });
    }

    return res.status(200).json({
      data: court,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Gagal mengambil detail lapangan",
      error: error.message,
    });
  }
};

// CREATE COURT
export const addCourt = async (req: Request, res: Response) => {
  try {
    const { name, type, price, description, image, isActive } = req.body;

    if (!name || !type || price === undefined) {
      return res.status(400).json({
        message: "name, type, dan price wajib diisi",
      });
    }

    const court = await createCourt({
      name,
      type,
      price: Number(price),
      description,
      image,
      isActive: isActive ?? true,
    });

    return res.status(201).json({
      message: "Lapangan berhasil ditambahkan",
      data: court,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Gagal menambahkan lapangan",
      error: error.message,
    });
  }
};

// UPDATE COURT
export const updateCourt = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const court = await getCourtById(id);

    if (!court) {
      return res.status(404).json({
        message: "Lapangan tidak ditemukan",
      });
    }

    const payload = {
      ...req.body,
      ...(req.body.price !== undefined && {
        price: Number(req.body.price),
      }),
      ...(req.body.isActive !== undefined && {
        isActive: Boolean(req.body.isActive),
      }),
    };

    const updatedCourt = await updateCourtById(id, payload);

    return res.status(200).json({
      message: "Lapangan berhasil diupdate",
      data: updatedCourt,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Gagal mengupdate lapangan",
      error: error.message,
    });
  }
};

// DELETE COURT
export const deleteCourt = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const court = await getCourtById(id);

    if (!court) {
      return res.status(404).json({
        message: "Lapangan tidak ditemukan",
      });
    }

    await deleteCourtById(id);

    return res.status(200).json({
      message: "Lapangan berhasil dihapus",
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Gagal menghapus lapangan",
      error: error.message,
    });
  }
};