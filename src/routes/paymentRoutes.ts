import { Router, Request, Response, NextFunction } from "express";
import {
  getChannels,
  getPayment,
  chooseChannel,
  uploadProof,
  confirm,
  reject,
  addChannel,
  editChannel,
  removeChannel,
} from "../controllers/paymentController.js";
import { authenticate, checkAdmin } from "../middlewares/authMiddleware.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Hanya file gambar yang diperbolehkan"));
  },
});

// wrapper biar multer ga konflik sama CustomRequest
const uploadSingle = (fieldName: string) =>
  (req: Request, res: Response, next: NextFunction) =>
    upload.single(fieldName)(req, res, next);

const router = Router();

// channel
router.get("/channels", getChannels);
router.post("/channels", authenticate, checkAdmin, uploadSingle("qrImage"), addChannel as any);
router.put("/channels/:id", authenticate, checkAdmin, uploadSingle("qrImage"), editChannel as any);
router.delete("/channels/:id", authenticate, checkAdmin, removeChannel as any);

// payment per booking
router.get("/:bookingId", authenticate, getPayment as any);
router.post("/:bookingId/choose-channel", authenticate, chooseChannel as any);
router.post("/:bookingId/upload-proof", authenticate, uploadSingle("proof"), uploadProof as any);
router.put("/:bookingId/confirm", authenticate, checkAdmin, confirm as any);
router.put("/:bookingId/reject", authenticate, checkAdmin, reject as any);

export default router;