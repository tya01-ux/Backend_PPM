import { Request, Response } from "express";
import { registerUser } from "../services/AuthService.js";
import { loginUser } from "../services/AuthService.js";

export const register = async (
    req: Request,
    res: Response
) => {
    try {
        const { name, email, password, phone } = req.body;

        const user = await registerUser(
            name,
            email,
            password,
            phone
        );

        res.status(201).json({
            message: "Register berhasil",
            data: user,
        });
    } catch (error: any) {
        res.status(400).json({
            message: error.message,
        });
    }
};

export const login = async (
    req: Request,
    res: Response
) => {
    try {
        const { email, password } = req.body;

        const { token, user } = await loginUser(email, password);

        res.status(200).json({
            message: "Login berhasil",
            data: {
                token,
                user,
            },
        });
    } catch (error: any) {
        res.status(400).json({
            message: error.message,
        });
    }
};
