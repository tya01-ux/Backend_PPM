import { Router, Request, Response, NextFunction } from "express";
import { getSettings, updateSettings } from "../controllers/venueController.js";
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

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

const uploadFields = (req: Request, res: Response, next: NextFunction) =>
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ])(req, res, next);

const router = Router();

router.get("/", getSettings);
router.put("/", authenticate, checkAdmin, uploadFields, updateSettings as any);

export default router;