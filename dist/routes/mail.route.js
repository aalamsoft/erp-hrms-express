"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mail_controller_1 = require("../controller/mail.controller");
const router = express_1.default.Router();
router.post("/leave-plan", mail_controller_1.leavePlanMail);
router.get("/leave-plan-update-reminder", mail_controller_1.leavePlanUpdateReminder);
router.post("/manager-leave-approval-reminder", mail_controller_1.managerLeaveApprovalReminder);
exports.default = router;
