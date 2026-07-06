import { prisma } from "../lib/db.js";

export const ALLOWED_THEMES = ["slate", "amber", "blue", "violet"] as const;
export type MembershipTheme = (typeof ALLOWED_THEMES)[number];

export type MembershipInput = {
  name: string;
  price: number;
  duration: number;
  quotaLabel?: string | null;
  description?: string | null;
  benefits: string[];
  isPopular?: boolean;
  theme: MembershipTheme;
};

export type MembershipUpdateInput = Partial<MembershipInput>;

// Validasi bersama untuk create & update — dipanggil dari controller
// sebelum data masuk ke Prisma, biar frontend nggak pernah nerima
// data korup (theme sembarangan / benefits bukan array).
export const validateMembershipInput = (
  data: Partial<MembershipInput>,
  { isUpdate = false }: { isUpdate?: boolean } = {}
) => {
  const errors: string[] = [];

  if (!isUpdate || data.name !== undefined) {
    if (!data.name || typeof data.name !== "string") {
      errors.push("name wajib diisi dan harus berupa string");
    }
  }

  if (!isUpdate || data.price !== undefined) {
    if (typeof data.price !== "number" || data.price < 0) {
      errors.push("price wajib berupa angka >= 0");
    }
  }

  if (!isUpdate || data.duration !== undefined) {
    if (typeof data.duration !== "number" || data.duration <= 0) {
      errors.push("duration wajib berupa angka hari > 0");
    }
  }

  if (!isUpdate || data.benefits !== undefined) {
    if (
      !Array.isArray(data.benefits) ||
      data.benefits.some((b) => typeof b !== "string")
    ) {
      errors.push("benefits wajib berupa array of string");
    }
  }

  if (!isUpdate || data.theme !== undefined) {
    if (!data.theme || !ALLOWED_THEMES.includes(data.theme as any)) {
      errors.push(`theme wajib salah satu dari: ${ALLOWED_THEMES.join(", ")}`);
    }
  }

  return errors;
};

// GET ALL
export const getAllMemberships = async () => {
  return await prisma.membership.findMany({
    orderBy: { price: "asc" },
  });
};

// GET BY ID
export const getMembershipById = async (id: number) => {
  return await prisma.membership.findUnique({
    where: { id },
  });
};

// CREATE
export const createMembership = async (data: MembershipInput) => {
  return await prisma.membership.create({
    data: {
      name: data.name,
      price: data.price,
      duration: data.duration,
      quotaLabel: data.quotaLabel ?? null,
      description: data.description ?? null,
      benefits: data.benefits,
      isPopular: data.isPopular ?? false,
      theme: data.theme,
    },
  });
};

// UPDATE
export const updateMembershipById = async (
  id: number,
  data: MembershipUpdateInput
) => {
  return await prisma.membership.update({
    where: { id },
    data,
  });
};

// DELETE
export const deleteMembershipById = async (id: number) => {
  return await prisma.membership.delete({
    where: { id },
  });
};