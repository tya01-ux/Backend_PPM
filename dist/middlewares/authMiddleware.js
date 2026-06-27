import jwt from "jsonwebtoken";
import { prisma } from "../lib/db.js";
// AUTHENTICATION
export const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthenticated, format token tidak valid" });
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Token tidak ditemukan" });
    }
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
        return res.status(500).json({ message: "JWT_SECRET belum dikonfigurasi" });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = {
            userId: decoded.id,
            ...(decoded.email !== undefined && { email: decoded.email }),
            ...(decoded.role !== undefined && { role: decoded.role }),
        };
        next();
    }
    catch {
        return res.status(403).json({ message: "Token tidak valid atau sudah kadaluarsa" });
    }
};
// AUTHORIZATION ADMIN (satu-satunya versi — selalu cek role ke DB)
export const checkAdmin = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized. Silakan login terlebih dahulu" });
        }
        const dbUser = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: { role: true },
        });
        if (!dbUser) {
            return res.status(401).json({ message: "User tidak ditemukan" });
        }
        if (dbUser.role.toLowerCase() !== "admin") {
            return res.status(403).json({ message: "Akses ditolak. Hanya admin yang dapat mengakses fitur ini" });
        }
        next();
    }
    catch (error) {
        console.error("CHECK ADMIN ERROR:", error);
        return res.status(500).json({ message: "Terjadi kesalahan saat validasi admin" });
    }
};
//# sourceMappingURL=authMiddleware.js.map