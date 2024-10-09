import express from "express";
import { leavePlanMail } from "../controller/mail.controller";

const router = express.Router();

router.post("/leave-plan", leavePlanMail);
export default router;
