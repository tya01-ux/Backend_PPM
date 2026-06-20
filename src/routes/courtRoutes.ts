import { Router } from "express";
import { 
    getCourts, 
    getCourt, 
    addCourt, 
    updateCourt, 
    deleteCourt 
} from "../controllers/courtController.js";

const router = Router();

router.get("/", getCourts);
router.get("/:id", getCourt);
router.post("/", addCourt);
router.put("/:id", updateCourt);
router.delete("/:id", deleteCourt);

export default router;