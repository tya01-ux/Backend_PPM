export const checkAdmin = (req, res, next) => {
    const user = req.user; // biasanya dari middleware auth
    if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    if (user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden: Admin only" });
    }
    next();
};
//# sourceMappingURL=logger.js.map