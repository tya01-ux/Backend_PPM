import { Router } from "express";
import { getPromos, addPromo, updatePromo, deletePromo, checkPromo, } from "../controllers/promoController.js";
import { authenticate, checkAdmin } from "../middlewares/authMiddleware.js";
const router = Router();
router.get("/", authenticate, checkAdmin, getPromos);
router.post("/", authenticate, checkAdmin, addPromo);
router.put("/:id", authenticate, checkAdmin, updatePromo);
router.delete("/:id", authenticate, checkAdmin, deletePromo);
router.post("/check", authenticate, checkPromo); // user bisa cek promo
export default router;
//# sourceMappingURL=promoRoutes.js.map