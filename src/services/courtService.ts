import { prisma } from "../lib/db.js";

export const getAllCourts = async () => {
    return await prisma.court.findMany();
};

// Court Read
export const getCourtById = async (id: number) => {
    return await prisma.court.findUnique({
        where: { id },
    });
};

// Court Create
export const createCourt = async (data: {
    name: string;
    type: string;
    price: number;
    description?: string;
    image?: string;
}) => {
    return await prisma.court.create({
        data,
    });
};

// Coust Update
export const updateCourtById = async (
    id: number,
    data: {
        name?: string;
        type?: string;
        price?: number;
        description?: string;
        image?: string;
    }
) => {
    return await prisma.court.update({
        where: { id },
        data,
    });
};

// counst Delete
export const deleteCourtById = async (id: number) => {
    return await prisma.court.delete({
        where: { id },
    });
};