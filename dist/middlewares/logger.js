export const checkAdmin = (req, res, next) => {
    const user = req.user; // Diambil dari data hasil decode middleware authenticate
    if (!user) {
        return res.status(401).json({ message: "Unauthorized. Anda belum login" });
    }
    next();
};
//# sourceMappingURL=logger.js.map