import { prisma } from "../lib/db.js";
export const getAllUsers = async () => {
    return await prisma.user.findMany();
};
export const getUserById = async (id) => {
    return await prisma.user.findUnique({
        where: { id },
    });
};
export const updateUserById = async (id, data) => {
    return await prisma.user.update({
        where: { id },
        data,
    });
};
export const deleteUserById = async (id) => {
    return await prisma.user.delete({
        where: { id },
    });
};
//# sourceMappingURL=userService.js.map