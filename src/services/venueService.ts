import { prisma } from "../lib/db.js";

// ambil row pertama, kalau belum ada bikin default
export const getVenue = async () => {
  let venue = await prisma.venue.findFirst();
  if (!venue) {
    venue = await prisma.venue.create({ data: {} });
  }
  return venue;
};

export const updateVenue = async (data: {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  openHour?: string;
  closeHour?: string;
  logo?: string;
  banner?: string;
}) => {
  const venue = await getVenue();
  return await prisma.venue.update({
    where: { id: venue.id },
    data,
  });
};