import { Router } from "express";
import { getChannels, getPayment, chooseChannel, uploadProof, confirm, reject, addChannel, editChannel, removeChannel, } from "../controllers/paymentController.js";
import { authenticate, checkAdmin } from "../middlewares/authMiddleware.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir))
    fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
    destination: (_, __, cb) => cb(null, uploadDir),
    filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_, file, cb) => {
        const allowed = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
        if (allowed.includes(file.mimetype))
            cb(null, true);
        else
            cb(new Error("Hanya file gambar yang diperbolehkan"));
    },
});
// wrapper biar multer ga konflik sama CustomRequest
const uploadSingle = (fieldName) => (req, res, next) => upload.single(fieldName)(req, res, next);
const router = Router();
// channel
router.get("/channels", getChannels);
router.post("/channels", authenticate, checkAdmin, uploadSingle("qrImage"), addChannel);
router.put("/channels/:id", authenticate, checkAdmin, uploadSingle("qrImage"), editChannel);
router.delete("/channels/:id", authenticate, checkAdmin, removeChannel);
// payment per booking
router.get("/:bookingId", authenticate, getPayment);
router.post("/:bookingId/choose-channel", authenticate, chooseChannel);
router.post("/:bookingId/upload-proof", authenticate, uploadSingle("proof"), uploadProof);
router.put("/:bookingId/confirm", authenticate, checkAdmin, confirm);
router.put("/:bookingId/reject", authenticate, checkAdmin, reject);
export default router;
//# sourceMappingURL=paymentRoutes.js.map