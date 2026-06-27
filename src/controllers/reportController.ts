import { Request, Response } from "express";
import {
  getRevenueReport,
  getBookingReport,
  getMembershipReport,
} from "../services/reportService.js";

const parseRange = (req: Request) => {
  const { startDate, endDate, courtId } = req.query;

  const start = startDate ? new Date(String(startDate)) : new Date(new Date().setDate(1));
  const end = endDate ? new Date(String(endDate)) : new Date();
  end.setHours(23, 59, 59, 999); // include seluruh hari endDate

  return {
    startDate: start,
    endDate: end,
    ...(courtId && { courtId: Number(courtId) }),
  };
};

export const revenueReport = async (req: Request, res: Response) => {
  try {
    const range = parseRange(req);
    const data = await getRevenueReport(range);
    return res.json({ data });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const bookingReport = async (req: Request, res: Response) => {
  try {
    const range = parseRange(req);
    const data = await getBookingReport(range);
    return res.json({ data });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const membershipReport = async (req: Request, res: Response) => {
  try {
    const range = parseRange(req);
    const data = await getMembershipReport(range);
    return res.json({ data });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};