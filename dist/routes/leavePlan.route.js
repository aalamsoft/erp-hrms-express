"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const leavePlan_controller_1 = require("../controller/leavePlan.controller");
const multer_1 = __importDefault(require("multer"));
const router = express_1.default.Router();
const upload = (0, multer_1.default)({ dest: "uploads/" });
// Define your routes
router.get("/getAll", leavePlan_controller_1.leavePlan);
router.post("/getLeavePlanReport", leavePlan_controller_1.getLeaveReport);
exports.default = router;
