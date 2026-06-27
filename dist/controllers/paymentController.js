import { getPaymentChannels, choosePaymentChannel, uploadPaymentProof, confirmPayment, rejectPayment, getPaymentByBookingId, createPaymentChannel, updatePaymentChannel, deletePaymentChannel, } from "../services/paymentService.js";
export const getChannels = async (req, res) => {
    try {
        const channels = await getPaymentChannels();
        return res.json({ data: channels });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
export const getPayment = async (req, res) => {
    try {
        const payment = await getPaymentByBookingId(Number(req.params.bookingId), req.user.userId, req.user.role);
        return res.json({ data: payment });
    }
    catch (error) {
        return res.status(403).json({ message: error.message });
    }
};
export const chooseChannel = async (req, res) => {
    try {
        const { paymentChannelId, promoCode } = req.body;
        if (!paymentChannelId) {
            return res.status(400).json({ message: "paymentChannelId wajib diisi" });
        }
        const payment = await choosePaymentChannel(Number(req.params.bookingId), req.user.userId, req.user.role, Number(paymentChannelId), promoCode);
        return res.json({ message: "Metode pembayaran dipilih", data: payment });
    }
    catch (error) {
        return res.status(400).json({ message: error.message });
    }
};
export const uploadProof = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "File bukti wajib diupload" });
        }
        const result = await uploadPaymentProof(Number(req.params.bookingId), req.user.userId, req.user.role, req.file.filename);
        return res.json(result);
    }
    catch (error) {
        return res.status(400).json({ message: error.message });
    }
};
export const confirm = async (req, res) => {
    try {
        const result = await confirmPayment(Number(req.params.bookingId));
        return res.json(result);
    }
    catch (error) {
        return res.status(400).json({ message: error.message });
    }
};
export const reject = async (req, res) => {
    try {
        const { note } = req.body;
        if (!note)
            return res.status(400).json({ message: "Note wajib diisi" });
        const result = await rejectPayment(Number(req.params.bookingId), note);
        return res.json(result);
    }
    catch (error) {
        return res.status(400).json({ message: error.message });
    }
};
// ── ADMIN: kelola channel ──
export const addChannel = async (req, res) => {
    try {
        const { name, type, accountNumber, accountName } = req.body;
        if (!name || !type) {
            return res.status(400).json({ message: "name dan type wajib diisi" });
        }
        // kalau ada file QR yang diupload
        const qrImage = req.file ? `/uploads/${req.file.filename}` : req.body.qrImage;
        const channel = await createPaymentChannel({
            name, type, accountNumber, accountName, qrImage,
        });
        return res.status(201).json({ message: "Channel berhasil ditambahkan", data: channel });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
export const editChannel = async (req, res) => {
    try {
        const qrImage = req.file ? `/uploads/${req.file.filename}` : req.body.qrImage;
        const channel = await updatePaymentChannel(Number(req.params.id), {
            ...req.body,
            ...(qrImage && { qrImage }),
        });
        return res.json({ message: "Channel berhasil diupdate", data: channel });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
export const removeChannel = async (req, res) => {
    try {
        await deletePaymentChannel(Number(req.params.id));
        return res.json({ message: "Channel berhasil dinonaktifkan" });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
//# sourceMappingURL=paymentController.js.map