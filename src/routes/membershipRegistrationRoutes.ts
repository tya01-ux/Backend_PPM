import { Router } from "express";
import {getMembershipRegistrations,getMembershipRegistration,addMembershipRegistration,approveMembershipRegistrationHandler,rejectMembershipRegistrationHandler,} from "../controllers/membershipregistrationcontroller.js";

const router = Router();

router.get("/", getMembershipRegistrations);
router.get("/:id", getMembershipRegistration);
router.post("/", addMembershipRegistration);
router.patch("/:id/approve", approveMembershipRegistrationHandler);
router.patch("/:id/reject", rejectMembershipRegistrationHandler);

export default router;