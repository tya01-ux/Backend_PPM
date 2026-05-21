import express from "express";
import { getSpeakers, createSpeaker, showSpeaker, updateSpeaker, deleteSpeaker } from "../controllers/speakerController.js";

const router = express.Router();


router.get("/", getSpeakers);
router.post("/", createSpeaker);
router.get("/:id", showSpeaker);
router.put("/:id", updateSpeaker);
router.delete("/:id", deleteSpeaker);

export default router;
