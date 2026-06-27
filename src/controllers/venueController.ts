import { Request, Response } from "express";
import { getVenue, updateVenue } from "../services/venueService.js";

type VenueRequestWithFiles = Request & {
  files?: {
    logo?: { filename: string }[];
    banner?: { filename: string }[];
  };
};

export const getSettings = async (_req: Request, res: Response) => {
  try {
    const venue = await getVenue();
    return res.json({ data: venue });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateSettings = async (req: VenueRequestWithFiles, res: Response) => {
  try {
    const { name, address, phone, email, openHour, closeHour } = req.body;

    const logo = req.files?.logo?.[0] ? `/uploads/${req.files.logo[0].filename}` : undefined;
    const banner = req.files?.banner?.[0] ? `/uploads/${req.files.banner[0].filename}` : undefined;

    const venue = await updateVenue({
      ...(name && { name }),
      ...(address && { address }),
      ...(phone && { phone }),
      ...(email && { email }),
      ...(openHour && { openHour }),
      ...(closeHour && { closeHour }),
      ...(logo && { logo }),
      ...(banner && { banner }),
    });

    return res.json({ message: "Pengaturan berhasil disimpan", data: venue });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};