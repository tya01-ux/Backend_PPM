import { Response } from "express";
import { CustomRequest } from "../middlewares/authMiddleware.js";
import {
  getNotificationsForUser,
  getUnreadCount,
  markNotificationAsRead,
  markAllAsRead,
} from "../services/notificationservice.js";

// GET /notifications
// Dipakai buat nge-render dropdown bell + badge angka unread.
export const getNotifications = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const [notifications, unreadCount] = await Promise.all([
      getNotificationsForUser(userId),
      getUnreadCount(userId),
    ]);

    return res.json({ data: notifications, unreadCount });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// PATCH /notifications/:id/read
export const readNotification = async (req: CustomRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID notifikasi tidak valid" });
    }

    const result = await markNotificationAsRead(id, req.user!.userId);
    return res.json({ message: "Notifikasi ditandai sudah dibaca", data: result });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

// PATCH /notifications/read-all
export const readAllNotifications = async (req: CustomRequest, res: Response) => {
  try {
    await markAllAsRead(req.user!.userId);
    return res.json({ message: "Semua notifikasi ditandai sudah dibaca" });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};