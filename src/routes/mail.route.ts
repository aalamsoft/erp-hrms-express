import express from "express";
import {
  leavePlanMail,
  leavePlanUpdateReminder,
  managerLeaveApprovalReminder,
} from "../controller/mail.controller";

const router = express.Router();

router.post("/leave-plan", leavePlanMail);
router.get("/leave-plan-update-reminder", leavePlanUpdateReminder);
router.post("/manager-leave-approval-reminder", managerLeaveApprovalReminder);
export default router;
