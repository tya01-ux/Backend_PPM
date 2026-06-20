import { prisma } from "../lib/db.js";

export const getAllMemberships = async () => {
    return await prisma.membership.findMany();
};

export const getMembershipById = async (id: number) => {
    return await prisma.membership.findUnique({
        where: { id },
    });
};

export const createMembership = async (data: {
    name: string;
    price: number;
    duration: number;
    description?: string;
}) => {
    return await prisma.membership.create({
        data,
    });
};

export const updateMembershipById = async (
    id: number,
    data: {
        name?: string;
        price?: number;
        duration?: number;
        description?: string;
    }
) => {
    return await prisma.membership.update({
        where: { id },
        data,
    });
};

export const deleteMembershipById = async (id: number) => {
    return await prisma.membership.delete({
        where: { id },
    });
};