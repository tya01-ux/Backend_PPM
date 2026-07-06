import { Router } from "express";
import {getUserMemberships,getUserMembership,getUserMembershipByUser,addUserMembership,deleteUserMembership,} from "../controllers/usermembershipcontroller.js";

const router = Router();

router.get("/", getUserMemberships);
router.get("/user/:userId", getUserMembershipByUser);
router.get("/:id", getUserMembership);
router.post("/", addUserMembership);
router.delete("/:id", deleteUserMembership);

export default router;