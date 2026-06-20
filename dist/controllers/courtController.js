import { getAllCourts, getCourtById, createCourt, updateCourtById, deleteCourtById, } from "../services/courtService.js";
export const getCourts = async (req, res) => {
    const courts = await getAllCourts();
    res.json(courts);
};
export const getCourt = async (req, res) => {
    const id = Number(req.params.id);
    const court = await getCourtById(id);
    res.json(court);
};
export const addCourt = async (req, res) => {
    const court = await createCourt(req.body);
    res.status(201).json({
        message: "Lapangan berhasil ditambahkan",
        data: court,
    });
};
export const updateCourt = async (req, res) => {
    const id = Number(req.params.id);
    const court = await updateCourtById(id, req.body);
    res.json({
        message: "Lapangan berhasil diupdate",
        data: court,
    });
};
export const deleteCourt = async (req, res) => {
    const id = Number(req.params.id);
    await deleteCourtById(id);
    res.json({
        message: "Lapangan berhasil dihapus",
    });
};
//# sourceMappingURL=courtController.js.map