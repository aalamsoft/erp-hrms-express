import express, { Request, Response } from "express";
import { getLeaveReport, leavePlan } from "../controller/leavePlan.controller";
import multer from "multer";
import path from "path"; // Import path module
import { getSharePointAccessToken } from "../utils/sharepointAccess";

const router = express.Router();

// Define your routes
router.get("/getAll", leavePlan);
router.post("/getLeavePlanReport", getLeaveReport);
router.get("/getAccess", getSharePointAccessToken);

export default router;
