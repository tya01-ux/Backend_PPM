import { registerUser, loginUser } from "../services/AuthService.js";
export const register = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Nama, email, dan password wajib diisi",
            });
        }
        const user = await registerUser(name, email, password, phone);
        res.status(201).json({
            message: "Register berhasil",
            data: user,
        });
    }
    catch (error) {
        res.status(400).json({
            message: error.message,
        });
    }
};
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                message: "Email dan password wajib diisi",
            });
        }
        const { token, user } = await loginUser(email, password);
        res.status(200).json({
            message: "Login berhasil",
            data: {
                token,
                user,
            },
        });
    }
    catch (error) {
        res.status(400).json({
            message: error.message,
        });
    }
};
//# sourceMappingURL=AuthController.js.map