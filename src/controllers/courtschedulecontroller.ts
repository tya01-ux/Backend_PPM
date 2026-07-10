import { Response } from "express";
import { CustomRequest } from "../middlewares/authMiddleware.js";
import {
  createCourtSchedule,
  getAllCourtSchedules,
  getCourtScheduleById,
  updateCourtSchedule,
  deleteCourtSchedule,
  getCombinedTimeline,
} from "../services/courtscheduleservice.js";

const resolveErrorStatus = (message: string) => {
  if (message.startsWith("NOT_FOUND:")) {
    return { status: 404, message: message.replace("NOT_FOUND: ", "") };
  }
  if (message.startsWith("CONFLICT:")) {
    return { status: 409, message: message.replace("CONFLICT: ", "") };
  }
  return { status: 500, message };
};

// CREATE
export const addCourtSchedule = async (req: CustomRequest, res: Response) => {
  try {
    const { courtId, type, title, notes, startAt, endAt } = req.body;
    const createdById = req.user?.userId;

    if (!createdById) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!courtId || !type || !title || !startAt || !endAt) {
      return res.status(400).json({
        message: "courtId, type, title, startAt, dan endAt wajib diisi",
      });
    }

    const schedule = await createCourtSchedule({
      courtId: Number(courtId),
      type,
      title,
      notes,
      startAt: new Date(startAt),
      endAt: new Date(endAt),
      createdById,
    });

    return res.status(201).json({
      message: "Jadwal berhasil ditambahkan",
      data: schedule,
    });
  } catch (error: any) {
    const { status, message } = resolveErrorStatus(error.message);
    return res.status(status).json({ message });
  }
};

// GET ALL (support query ?date=2025-05-20&courtId=1)
export const getCourtSchedules = async (req: CustomRequest, res: Response) => {
  try {
    const { date, courtId } = req.query;

    const params: { date?: Date; courtId?: number } = {};
    if (date) params.date = new Date(date as string);
    if (courtId) params.courtId = Number(courtId);

    const schedules = await getAllCourtSchedules(params);

    return res.json({ data: schedules });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// GET BY ID
export const getCourtSchedule = async (req: CustomRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID jadwal tidak valid" });
    }

    const schedule = await getCourtScheduleById(id);
    if (!schedule) {
      return res.status(404).json({ message: "Jadwal tidak ditemukan" });
    }

    return res.json({ data: schedule });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// UPDATE
export const updateCourtScheduleHandler = async (req: CustomRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID jadwal tidak valid" });
    }

    const { type, title, notes, startAt, endAt } = req.body;

    const payload: any = {
      ...(type !== undefined && { type }),
      ...(title !== undefined && { title }),
      ...(notes !== undefined && { notes }),
      ...(startAt ? { startAt: new Date(startAt) } : {}),
      ...(endAt ? { endAt: new Date(endAt) } : {}),
    };

    const schedule = await updateCourtSchedule(id, payload);

    return res.json({
      message: "Jadwal berhasil diupdate",
      data: schedule,
    });
  } catch (error: any) {
    const { status, message } = resolveErrorStatus(error.message);
    return res.status(status).json({ message });
  }
};

// DELETE
export const deleteCourtScheduleHandler = async (req: CustomRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID jadwal tidak valid" });
    }

    await deleteCourtSchedule(id);

    return res.json({ message: "Jadwal berhasil dihapus" });
  } catch (error: any) {
    const { status, message } = resolveErrorStatus(error.message);
    return res.status(status).json({ message });
  }
};

// GET TIMELINE GABUNGAN (booking + schedule) — dipakai halaman utama Jadwal Lapangan
export const getTimeline = async (req: CustomRequest, res: Response) => {
  try {
    const { date, courtId } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Query date wajib diisi" });
    }

    const timeline = await getCombinedTimeline(
      new Date(date as string),
      courtId ? Number(courtId) : undefined
    );

    return res.json({ data: timeline });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};