"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupLeaveReportScheduler = setupLeaveReportScheduler;
exports.setupManagerLeaveApprovalReminderScheduler = setupManagerLeaveApprovalReminderScheduler;
exports.setupLeavePlanUpdateReminderScheduler = setupLeavePlanUpdateReminderScheduler;
const date_fns_1 = require("date-fns");
const leavePlanService = __importStar(require("../services/leavePlan.service"));
const mail_services_1 = __importDefault(require("../services/mail.services"));
const nodeCron = require("node-cron");
function setupLeaveReportScheduler(cronExpression) {
    nodeCron.schedule(cronExpression, function () {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (process.env.LEAVEPLAN_SCHEDULER === "1") {
                    const currentDate = new Date();
                    const year = currentDate.getFullYear();
                    const month = currentDate.getMonth();
                    const startDate = (0, date_fns_1.format)((0, date_fns_1.startOfMonth)(new Date(year, month)), "yyyy-MM-dd");
                    const endDate = (0, date_fns_1.format)((0, date_fns_1.endOfMonth)(new Date(year, month)), "yyyy-MM-dd");
                    const object = {
                        startDate,
                        endDate,
                    };
                    const generateLeaveReport = yield leavePlanService.getLeaveReport(object);
                    if (generateLeaveReport.status) {
                        console.log(`Leave report generated successfully for ${(0, date_fns_1.format)(currentDate, "MMMM yyyy")}`);
                    }
                    else {
                        console.log(`Failed to generate leave report for ${(0, date_fns_1.format)(currentDate, "MMMM yyyy")}:`, generateLeaveReport.message);
                    }
                }
            }
            catch (error) {
                console.error("Error in LEAVEPLANREPORT_CRON_JOB:", error);
            }
        });
    });
}
function setupManagerLeaveApprovalReminderScheduler(cronExpression) {
    nodeCron.schedule(cronExpression, function () {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (process.env.MANAGER_LEAVE_APPROVAL_REMINDER_SCHEDULER === "1") {
                    const bccList = ((_a = process.env.GROUP_EMAIL) === null || _a === void 0 ? void 0 : _a.split(",").map((email) => email.trim())) ||
                        [];
                    const result = yield mail_services_1.default.sendManagerLeaveApprovalReminder({
                        bccList,
                    });
                    if (result.status) {
                        console.log("Manager leave approval reminders sent successfully");
                    }
                    else {
                        console.log("Failed to send manager leave approval reminders:", result.message);
                    }
                }
            }
            catch (error) {
                console.error("Error in MANAGER_LEAVE_APPROVAL_REMINDER_CRON_JOB:", error);
            }
        });
    });
}
function setupLeavePlanUpdateReminderScheduler(cronExpression) {
    nodeCron.schedule(cronExpression, function () {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (process.env.LEAVE_PLAN_UPDATE_REMINDER_SCHEDULER === "1") {
                    const bccList = ((_a = process.env.GROUP_EMAIL) === null || _a === void 0 ? void 0 : _a.split(",").map((email) => email.trim())) ||
                        [];
                    const result = yield mail_services_1.default.sendLeavePlanUpdateReminder({
                        bccList,
                    });
                    if (result.status) {
                        console.log("Leave plan update reminders sent successfully");
                    }
                    else {
                        console.log("Failed to send leave plan update reminders:", result.message);
                    }
                }
            }
            catch (error) {
                console.error("Error in LEAVE_PLAN_UPDATE_REMINDER_CRON_JOB:", error);
            }
        });
    });
}
