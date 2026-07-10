import { prisma } from "../lib/db.js";
const db: any = prisma;
import { NotificationType } from "@prisma/client";

type CreateNotificationInput = {
  userId: number;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
};

// Buat satu notifikasi untuk satu user tertentu.
// Dipanggil dari service lain (booking, membership) setelah
// event penting terjadi (approve, reject, dst).
export const createNotification = async (data: CreateNotificationInput) => {
  return await db.notification.create({
    data: {
      userId: data.userId,
      title: data.title,
      message: data.message,
      type: data.type,
      link: data.link ?? null,
    },
  });
};

// Broadcast ke semua admin — dipakai misal saat ada booking/registrasi
// membership baru masuk, biar semua admin yang login bisa lihat.
export const notifyAllAdmins = async (
  data: Omit<CreateNotificationInput, "userId">
) => {
  const admins: { id: number }[] = await db.user.findMany({
    where: { role: "admin" },
    select: { id: true },
  });

  if (admins.length === 0) return { count: 0 };

  return await db.notification.createMany({
    data: admins.map((a) => ({
      userId: a.id,
      title: data.title,
      message: data.message,
      type: data.type,
      link: data.link ?? null,
    })),
  });
};

// GET notifikasi milik user yang login, terbaru duluan.
export const getNotificationsForUser = async (userId: number, limit = 30) => {
  return await db.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
};

export const getUnreadCount = async (userId: number) => {
  return await db.notification.count({
    where: { userId, isRead: false },
  });
};

// Tandai satu notifikasi sebagai sudah dibaca.
// Cek kepemilikan dulu supaya user A gak bisa mark-read punya user B.
export const markNotificationAsRead = async (id: number, userId: number) => {
  const notif = await db.notification.findUnique({ where: { id } });
  if (!notif) throw new Error("Notifikasi tidak ditemukan");
  if (notif.userId !== userId) throw new Error("Akses ditolak");

  return await db.notification.update({
    where: { id },
    data: { isRead: true },
  });
};

export const markAllAsRead = async (userId: number) => {
  return await db.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
};