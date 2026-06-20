import { getAllMemberships, getMembershipById, createMembership, updateMembershipById, deleteMembershipById, } from "../services/membershipService.js";
export const getMemberships = async (req, res) => {
    const memberships = await getAllMemberships();
    res.json(memberships);
};
export const getMembership = async (req, res) => {
    const id = Number(req.params.id);
    const membership = await getMembershipById(id);
    res.json(membership);
};
export const addMembership = async (req, res) => {
    const membership = await createMembership(req.body);
    res.status(201).json({
        message: "Membership berhasil ditambahkan",
        data: membership,
    });
};
export const updateMembership = async (req, res) => {
    const id = Number(req.params.id);
    const membership = await updateMembershipById(id, req.body);
    res.json({
        message: "Membership berhasil diupdate",
        data: membership,
    });
};
export const deleteMembership = async (req, res) => {
    const id = Number(req.params.id);
    await deleteMembershipById(id);
    res.json({
        message: "Membership berhasil dihapus",
    });
};
//# sourceMappingURL=membershipController.js.map