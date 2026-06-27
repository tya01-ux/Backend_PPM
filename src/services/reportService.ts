import { prisma } from "../lib/db.js";

interface RangeParams {
  startDate: Date;
  endDate: Date;
  courtId?: number;
}

// ── LAPORAN PENDAPATAN ──
export const getRevenueReport = async ({ startDate, endDate, courtId }: RangeParams) => {
  const payments = await prisma.payment.findMany({
    where: {
      status: "confirmed",
      confirmedAt: { gte: startDate, lte: endDate },
      ...(courtId && { booking: { courtId } }),
    },
    include: { booking: { include: { court: true } } },
    orderBy: { confirmedAt: "asc" },
  });

  const totalRevenue = payments.reduce((sum, p) => sum + p.totalAmount, 0);
  const totalBooking = payments.length;

  const days = Math.max(
    1,
    Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
  );
  const avgPerDay = Math.round(totalRevenue / days);

  // group by tanggal untuk grafik
  const grouped: Record<string, number> = {};
  payments.forEach((p) => {
    const date = (p.confirmedAt ?? p.createdAt).toISOString().slice(0, 10);
    grouped[date] = (grouped[date] || 0) + p.totalAmount;
  });

  const chart = Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, total]) => ({ date, total }));

  return { totalRevenue, totalBooking, avgPerDay, chart };
};

// ── LAPORAN BOOKING (status breakdown) ──
export const getBookingReport = async ({ startDate, endDate, courtId }: RangeParams) => {
  const bookings = await prisma.booking.findMany({
    where: {
      createdAt: { gte: startDate, lte: endDate },
      ...(courtId && { courtId }),
    },
    include: { court: true },
  });

  const totalBooking = bookings.length;
  const byStatus: Record<string, number> = {};
  bookings.forEach((b) => {
    byStatus[b.status] = (byStatus[b.status] || 0) + 1;
  });

  const byCourt: Record<string, number> = {};
  bookings.forEach((b) => {
    const name = b.court.name;
    byCourt[name] = (byCourt[name] || 0) + 1;
  });

  return { totalBooking, byStatus, byCourt };
};

// ── LAPORAN MEMBERSHIP ──
export const getMembershipReport = async ({ startDate, endDate }: RangeParams) => {
  const memberships = await prisma.userMembership.findMany({
    where: { startDate: { gte: startDate, lte: endDate } },
    include: { membership: true, user: { select: { name: true, email: true } } },
  });

  const totalMember = memberships.length;
  const totalRevenue = memberships.reduce((sum, m) => sum + m.membership.price, 0);

  return { totalMember, totalRevenue, list: memberships };
};