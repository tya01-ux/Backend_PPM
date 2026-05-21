import { prisma } from "../lib/db.js";
// GET ALL EVENTS
export const getEvents = async (req, res) => {
    try {
        const events = await prisma.event.findMany();
        res.json(events);
    }
    catch (error) {
        res.status(500).json({
            message: "Gagal mengambil data",
            error,
        });
    }
};
// CREATE EVENT
export const createEvent = async (req, res) => {
    try {
        const { name, categoryId, location, dateEvent, description } = req.body;
        if (!name || !categoryId || !location || !dateEvent || !description) {
            return res.status(400).json({
                message: "Semua field wajib diisi",
            });
        }
        const newEvent = await prisma.event.create({
            data: {
                name,
                categoryId,
                location,
                dateEvent: new Date(dateEvent),
                description,
            },
        });
        res.status(201).json({
            message: "Event berhasil dibuat",
            data: newEvent,
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Gagal membuat event",
            error,
        });
    }
};
// GET EVENT BY ID
export const showEvent = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const event = await prisma.event.findUnique({
            where: { id },
        });
        if (!event) {
            return res.status(404).json({
                message: "Event tidak ditemukan",
            });
        }
        res.json(event);
    }
    catch (error) {
        res.status(500).json({
            message: "Gagal mengambil detail event",
            error,
        });
    }
};
// UPDATE EVENT
export const updateEvent = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const existingEvent = await prisma.event.findUnique({
            where: { id },
        });
        if (!existingEvent) {
            return res.status(404).json({
                message: "Event tidak ditemukan",
            });
        }
        const { name, categoryId, location, dateEvent, description } = req.body;
        const updatedEvent = await prisma.event.update({
            where: { id },
            data: {
                name,
                categoryId,
                location,
                dateEvent: new Date(dateEvent),
                description,
            },
        });
        res.json({
            message: "Event berhasil diupdate",
            data: updatedEvent,
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Gagal update event",
            error,
        });
    }
};
// DELETE EVENT
export const deleteEvent = async (req, res) => {
    try {
        const id = Number(req.params.id);
        await prisma.event.delete({
            where: { id },
        });
        res.json({
            message: "Event berhasil dihapus",
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Gagal menghapus event",
            error,
        });
    }
};
//# sourceMappingURL=eventController.js.map