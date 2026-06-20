export const getProfile = async (req, res) => {
    res.status(200).json({
        message: "Profile berhasil diambil",
        data: req.user,
    });
};
//# sourceMappingURL=userController.js.map