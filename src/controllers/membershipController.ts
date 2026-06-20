import { Request, Response } from "express";
import {
    getAllMemberships,
    getMembershipById,
    createMembership,
    updateMembershipById,
    deleteMembershipById,
} from "../services/membershipService.js";

export const getMemberships = async (
    req: Request,
    res: Response
) => {
    const memberships = await getAllMemberships();

    res.json(memberships);
};

export const getMembership = async (
    req: Request,
    res: Response
) => {
    const id = Number(req.params.id);

    const membership = await getMembershipById(id);

    res.json(membership);
};

export const addMembership = async (
    req: Request,
    res: Response
) => {
    const membership = await createMembership(req.body);

    res.status(201).json({
        message: "Membership berhasil ditambahkan",
        data: membership,
    });
};

export const updateMembership = async (
    req: Request,
    res: Response
) => {
    const id = Number(req.params.id);

    const membership = await updateMembershipById(
        id,
        req.body
    );

    res.json({
        message: "Membership berhasil diupdate",
        data: membership,
    });
};

export const deleteMembership = async (
    req: Request,
    res: Response
) => {
    const id = Number(req.params.id);

    await deleteMembershipById(id);

    res.json({
        message: "Membership berhasil dihapus",
    });
};