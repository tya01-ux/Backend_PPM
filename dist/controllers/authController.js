import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/db.js";
export const login = async (req, res) => {
    //menangkap data yang dikirim oleh client
    const { email, password } = req.body;
    //validasi input user
    if (!email || !password) {
        return res.status(400).json({ message: "Email dan password harus diisi" });
    }
    //cek existing user
    const exiatingUser = await prisma.user.findUnique({
        where: {
            email,
        },
    });
    //jika user tidak ditemukan, maka kembalikan response error
    if (!exiatingUser) {
        return res.status(400).json({ message: "Email tidak ditemukan" });
    }
    //jika password ditemukan, cek password
    const isPasswordValid = await bcrypt.compare(password, exiatingUser.password);
    if (!isPasswordValid) {
        return res.status(400).json({ message: "Password salah" });
    }
    const token = jwt.sign({ userId: exiatingUser.id }, process.env.JWT_SECRET || "secret_key", { expiresIn: "1h" });
    //jika password benar, kembalikan response sukses
    res.status(200).json({
        message: "Login berhasil",
        token,
        user: {
            name: exiatingUser.name,
            email: exiatingUser.email,
        },
    });
};
export const register = async (req, res) => {
    //menangkap data yang dikirim oleh client
    const { name, email, foto, password } = req.body;
    //validasi input user
    if (!name || !email || !password) {
        return res
            .status(400)
            .json({ message: "Nama, email, dan password harus diisi" });
    }
    //cek existing user
    //jika user sudah ada, maka kembalikan response error
    //jika user belum ada, maka buat user baru dan simpan ke database
    const existingUser = await prisma.user.findUnique({
        where: {
            email,
        },
    });
    if (existingUser) {
        return res.status(400).json({ message: "Email sudah terdaftar" });
    }
    //jika user belum ada, buat user baru dan simpan ke database
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
        data: {
            name,
            email,
            foto,
            password: hashedPassword,
        },
    });
    //kembalikan response sukses
    res.status(201).json({
        message: "User berhasil didaftarkan",
        user: {
            name: newUser.name,
            email: newUser.email,
        },
    });
};
//# sourceMappingURL=authController.js.map