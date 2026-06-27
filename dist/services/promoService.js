import { prisma } from "../lib/db.js";
export const getAllPromos = async () => {
    return await prisma.promo.findMany({ orderBy: { createdAt: "desc" } });
};
export const createPromo = async (data) => {
    return await prisma.promo.create({ data });
};
export const updatePromoById = async (id, data) => {
    return await prisma.promo.update({ where: { id }, data });
};
export const deletePromoById = async (id) => {
    return await prisma.promo.delete({ where: { id } });
};
export const validatePromo = async (code, courtPrice) => {
    const promo = await prisma.promo.findFirst({
        where: {
            code,
            isActive: true,
            startDate: { lte: new Date() },
            endDate: { gte: new Date() },
        },
    });
    if (!promo)
        throw new Error("Kode promo tidak valid atau sudah kadaluarsa");
    const discount = promo.isPercent
        ? Math.min(Math.round((courtPrice * promo.discount) / 100), promo.maxDiscount ?? Infinity)
        : promo.discount;
    return { promo, discount };
};
//# sourceMappingURL=promoService.js.map