import { Router } from "express";
import {
  getUserMemberships,
  getUserMembership,
  getUserMembershipByUser,
  addUserMembership,
  deleteUserMembership,
  getMyActiveUserMembership,
  getUserMembershipDetailHandler,
} from "../controllers/usermembershipcontroller.js";
import { authenticate, checkAdmin } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/my-active", authenticate, getMyActiveUserMembership);
router.get("/:id/detail", authenticate, getUserMembershipDetailHandler);

router.get("/", authenticate, checkAdmin, getUserMemberships);
router.get("/user/:userId", authenticate, checkAdmin, getUserMembershipByUser);
router.get("/:id", authenticate, checkAdmin, getUserMembership);
router.post("/", authenticate, checkAdmin, addUserMembership);
router.delete("/:id", authenticate, checkAdmin, deleteUserMembership);

export default router;