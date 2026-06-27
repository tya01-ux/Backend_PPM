import { prisma } from "../lib/db.js";
// GET ALL USERS
export const getAllUsers = async () => {
    return await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            createdAt: true,
        },
        orderBy: {
            id: "asc",
        },
    });
};
// GET USER BY ID
export const getUserById = async (id) => {
    return await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            createdAt: true,
        },
    });
};
// UPDATE USER
export const updateUserById = async (id, data) => {
    return await prisma.user.update({
        where: { id },
        data,
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            createdAt: true,
        },
    });
};
// DELETE USER
export const deleteUserById = async (id) => {
    const user = await prisma.user.findUnique({
        where: { id },
        select: {
            role: true,
        },
    });
    if (!user) {
        throw new Error("User tidak ditemukan");
    }
    if (user.role.toLowerCase() === "admin") {
        throw new Error("Admin tidak boleh dihapus");
    }
    return await prisma.user.delete({
        where: { id },
    });
};
//# sourceMappingURL=userService.js.map