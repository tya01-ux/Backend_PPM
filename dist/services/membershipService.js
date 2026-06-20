import { prisma } from "../lib/db.js";
export const getAllMemberships = async () => {
    return await prisma.membership.findMany();
};
export const getMembershipById = async (id) => {
    return await prisma.membership.findUnique({
        where: { id },
    });
};
export const createMembership = async (data) => {
    return await prisma.membership.create({
        data,
    });
};
export const updateMembershipById = async (id, data) => {
    return await prisma.membership.update({
        where: { id },
        data,
    });
};
export const deleteMembershipById = async (id) => {
    return await prisma.membership.delete({
        where: { id },
    });
};
//# sourceMappingURL=membershipService.js.map