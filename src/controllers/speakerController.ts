import { Request, Response } from "express";
import { prisma } from "../lib/db.js";


// GET ALL SPEAKERS
export const getSpeakers = async (req: Request, res: Response) => {
  try {
    const speakers = await prisma.pembicara.findMany();

    res.json(speakers);

  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil data speaker",
      error,
    });
  }
};


// CREATE SPEAKER
export const createSpeaker = async (req: Request, res: Response) => {
  try {
    const { name, role, image } = req.body;

    if (!name || !role || !image) {
      return res.status(400).json({
        message: "Semua field wajib diisi",
      });
    }

    const newSpeaker = await prisma.pembicara.create({
      data: {
        name,
        role,
        image,
      },
    });

    res.status(201).json({
      message: "Speaker berhasil dibuat",
      data: newSpeaker,
    });

  } catch (error) {
    res.status(500).json({
      message: "Gagal membuat speaker",
      error,
    });
  }
};


// GET SPEAKER BY ID
export const showSpeaker = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const speaker = await prisma.pembicara.findUnique({
      where: { id },
    });

    if (!speaker) {
      return res.status(404).json({
        message: "Speaker tidak ditemukan",
      });
    }

    res.json(speaker);

  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil detail speaker",
      error,
    });
  }
};


// UPDATE SPEAKER
export const updateSpeaker = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const existingSpeaker = await prisma.pembicara.findUnique({
      where: { id },
    });

    if (!existingSpeaker) {
      return res.status(404).json({
        message: "Speaker tidak ditemukan",
      });
    }

    const { name, role, image } = req.body;

    const updatedSpeaker = await prisma.pembicara.update({
      where: { id },
      data: {
        name,
        role,
        image,
      },
    });

    res.json({
      message: "Speaker berhasil diupdate",
      data: updatedSpeaker,
    });

  } catch (error) {
    res.status(500).json({
      message: "Gagal update speaker",
      error,
    });
  }
};


// DELETE SPEAKER
export const deleteSpeaker = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    await prisma.pembicara.delete({
      where: { id },
    });

    res.json({
      message: "Speaker berhasil dihapus",
    });

  } catch (error) {
    res.status(500).json({
      message: "Gagal menghapus speaker",
      error,
    });
  }
};