import { Request, Response } from "express";
import { getAllCourts, getCourtById, createCourt, updateCourtById, deleteCourtById, } from "../services/courtService.js";

export const getCourts = async (
    req: Request,
    res: Response
) => {
    const courts = await getAllCourts();

    res.json(courts);
};

export const getCourt = async (
    req: Request,
    res: Response
) => {
    const id = Number(req.params.id);

    const court = await getCourtById(id);

    res.json(court);
};

export const addCourt = async (
    req: Request,
    res: Response
) => {
    const court = await createCourt(req.body);

    res.status(201).json({
        message: "Lapangan berhasil ditambahkan",
        data: court,
    });
};

export const updateCourt = async (
    req: Request,
    res: Response
) => {
    const id = Number(req.params.id);

    const court = await updateCourtById(id, req.body);

    res.json({
        message: "Lapangan berhasil diupdate",
        data: court,
    });
};

export const deleteCourt = async (
    req: Request,
    res: Response
) => {
    const id = Number(req.params.id);

    await deleteCourtById(id);

    res.json({
        message: "Lapangan berhasil dihapus",
    });
};