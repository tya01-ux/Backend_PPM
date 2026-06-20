import { Request, Response } from "express";

export const getProfile = async (
    req: Request,
    res: Response
) => {
    res.status(200).json({
        message: "Profile berhasil diambil",
        data: (req as any).user,
    });
};