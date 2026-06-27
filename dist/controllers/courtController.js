import { getAllCourts, getCourtById, createCourt, updateCourtById, deleteCourtById } from "../services/courtService.js";
export const getCourts = async (req, res) => {
    try {
        const courts = await getAllCourts();
        res.json(courts);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const getCourt = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const court = await getCourtById(id);
        if (!court)
            return res.status(404).json({ message: "Lapangan tidak ditemukan" });
        res.json(court);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const addCourt = async (req, res) => {
    try {
        // Amankan tipe data price menjadi number sebelum masuk ke Prisma
        const payload = {
            ...req.body,
            price: Number(req.body.price),
            isActive: req.body.isActive !== undefined ? Boolean(req.body.isActive) : true
        };
        const court = await createCourt(payload);
        res.status(201).json({
            message: "Lapangan berhasil ditambahkan",
            data: court,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const updateCourt = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const payload = {
            ...req.body,
            ...(req.body.price && { price: Number(req.body.price) }),
            ...(req.body.isActive !== undefined && { isActive: Boolean(req.body.isActive) })
        };
        const court = await updateCourtById(id, payload);
        res.json({
            message: "Lapangan berhasil diupdate",
            data: court,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const deleteCourt = async (req, res) => {
    try {
        const id = Number(req.params.id);
        await deleteCourtById(id);
        res.json({
            message: "Lapangan berhasil dihapus",
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
//# sourceMappingURL=courtController.js.map