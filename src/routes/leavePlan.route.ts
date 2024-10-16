import express, { Request, Response } from "express";
import { getLeaveReport, leavePlan } from "../controller/leavePlan.controller";
import multer from "multer";
import path from "path"; // Import path module
import fs from "fs/promises";

const router = express.Router();
const upload = multer({ dest: "uploads/" });
// Define your routes
router.get("/getAll", leavePlan);
router.post("/getLeavePlanReport", getLeaveReport);

export default router;
