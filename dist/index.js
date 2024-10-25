"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const body_parser_1 = __importDefault(require("body-parser"));
const routes_1 = __importDefault(require("./routes"));
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http");
const leaveReportScheduler_1 = require("./schedulers/leaveReportScheduler");
const host = (_a = process.env.API_HOST) !== null && _a !== void 0 ? _a : "localhost";
const port = process.env.API_PORT ? Number(process.env.API_PORT) : 3000;
const app = (0, express_1.default)();
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.static("public"));
/* Parse JSON bodies */
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: false }));
const corsOptions = {
    origin: [`http://${host}:${port}`],
    credentials: true,
    optionsSuccessStatus: 200,
};
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,Authorization");
    next();
});
app.use((0, cors_1.default)(corsOptions));
app.use("/api", routes_1.default);
/* Socket Configuration */
const httpServer = (0, http_1.createServer)(app);
const ENABLE_SCHEDULERS = process.env.ENABLE_SCHEDULERS === "true";
if (ENABLE_SCHEDULERS) {
    console.log("Schedulers are enabled. Setting up cron jobs...");
    const LEAVEPLANREPORT_CRON_JOB = process.env.LEAVEPLANREPORT_CRON_JOB;
    const MANAGER_LEAVE_APPROVAL_REMINDER_CRON_JOB = process.env.MANAGER_LEAVE_APPROVAL_REMINDER_CRON_JOB;
    const LEAVE_PLAN_UPDATE_REMINDER_CRON_JOB = process.env.LEAVE_PLAN_UPDATE_REMINDER_CRON_JOB;
    if (LEAVEPLANREPORT_CRON_JOB) {
        (0, leaveReportScheduler_1.setupLeaveReportScheduler)(LEAVEPLANREPORT_CRON_JOB);
        console.log("Leave Plan Report scheduler set up for the 1st of every month at 11:00 AM");
    }
    else {
        console.log("Leave Plan Report scheduler not set up: Missing cron expression");
    }
    if (MANAGER_LEAVE_APPROVAL_REMINDER_CRON_JOB) {
        (0, leaveReportScheduler_1.setupManagerLeaveApprovalReminderScheduler)(MANAGER_LEAVE_APPROVAL_REMINDER_CRON_JOB);
        console.log("Manager Leave Approval Reminder scheduler set up for the 25th of every month");
    }
    else {
        console.log("Manager Leave Approval Reminder scheduler not set up: Missing cron expression");
    }
    if (LEAVE_PLAN_UPDATE_REMINDER_CRON_JOB) {
        (0, leaveReportScheduler_1.setupLeavePlanUpdateReminderScheduler)(LEAVE_PLAN_UPDATE_REMINDER_CRON_JOB);
        console.log("Leave Plan Update Reminder scheduler set up for the last day of every month");
    }
    else {
        console.log("Leave Plan Update Reminder scheduler not set up: Missing cron expression");
    }
    console.log("All schedulers have been set up successfully.");
}
else {
    console.log('Schedulers are disabled. Set ENABLE_SCHEDULERS to "true" in .env to enable them.');
}
httpServer.listen(port, host, () => {
    console.log(`ERP hrms API App Listening on Port http://${host}:${port}`);
});
