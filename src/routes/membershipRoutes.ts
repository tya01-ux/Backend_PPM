import { Router } from "express";
import {
    getMemberships,
    getMembership,
    addMembership,
    updateMembership,
    deleteMembership,
} from "../controllers/membershipController.js";

const router = Router();

router.get("/", getMemberships);
router.get("/:id", getMembership);
router.post("/", addMembership);
router.put("/:id", updateMembership);
router.delete("/:id", deleteMembership);

export default router;