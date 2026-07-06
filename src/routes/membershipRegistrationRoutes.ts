import { Router } from "express";
import {
  getMembershipRegistrations,
  getMembershipRegistration,
  addMembershipRegistration,
  submitPaymentProofHandler,
  moveToVerificationHandler,
  approveMembershipRegistrationHandler,
  rejectMembershipRegistrationHandler,
} from "../controllers/membershipregistrationcontroller.js";
import { authenticate, checkAdmin } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", authenticate, checkAdmin, getMembershipRegistrations);
router.get("/:id", authenticate, getMembershipRegistration);
router.post("/", authenticate, addMembershipRegistration);
router.patch("/:id/proof", authenticate, submitPaymentProofHandler);
router.patch("/:id/verify", authenticate, checkAdmin, moveToVerificationHandler);
router.patch("/:id/approve", authenticate, checkAdmin, approveMembershipRegistrationHandler);
router.patch("/:id/reject", authenticate, checkAdmin, rejectMembershipRegistrationHandler);

export default router;