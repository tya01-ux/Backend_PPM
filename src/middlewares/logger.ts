import { Request, Response, NextFunction } from "express";

export interface CustomRequest extends Request {
  user?: {
    userId: number;
    email: string;
  };
}

export const checkAdmin = (req: CustomRequest, res: Response, next: NextFunction) => {
  const user = req.user; // Diambil dari data hasil decode middleware authenticate

  if (!user) {
    return res.status(401).json({ message: "Unauthorized. Anda belum login" });
  }

  next();
};