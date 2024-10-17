require("dotenv").config();
import express from "express";
import morgan from "morgan";
import bodyParser from "body-parser";
import routes from "./routes";
import cors from "cors";
import { createServer } from "http";
import {
  setupLeavePlanUpdateReminderScheduler,
  setupLeaveReportScheduler,
  setupManagerLeaveApprovalReminderScheduler,
} from "./schedulers/leaveReportScheduler";
const host = process.env.API_HOST ?? "localhost";
const port = process.env.API_PORT ? Number(process.env.API_PORT) : 3000;

const app = express();

app.use(morgan("dev"));
app.use(express.static("public"));

/* Parse JSON bodies */
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: false }));

const corsOptions = {
  origin: [`http://${host}:${port}`],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept,Authorization"
  );
  next();
});

app.use(cors(corsOptions));
app.use("/api", routes);

/* Socket Configuration */

const httpServer = createServer(app);

const ENABLE_SCHEDULERS = process.env.ENABLE_SCHEDULERS === "true";

if (ENABLE_SCHEDULERS) {
  console.log("Schedulers are enabled. Setting up cron jobs...");
  const LEAVEPLANREPORT_CRON_JOB = process.env.LEAVEPLANREPORT_CRON_JOB;
  const MANAGER_LEAVE_APPROVAL_REMINDER_CRON_JOB =
    process.env.MANAGER_LEAVE_APPROVAL_REMINDER_CRON_JOB;
  const LEAVE_PLAN_UPDATE_REMINDER_CRON_JOB =
    process.env.LEAVE_PLAN_UPDATE_REMINDER_CRON_JOB;

  if (LEAVEPLANREPORT_CRON_JOB) {
    setupLeaveReportScheduler(LEAVEPLANREPORT_CRON_JOB);
    console.log(
      "Leave Plan Report scheduler set up for the 1st of every month at 11:00 AM"
    );
  } else {
    console.log(
      "Leave Plan Report scheduler not set up: Missing cron expression"
    );
  }

  if (MANAGER_LEAVE_APPROVAL_REMINDER_CRON_JOB) {
    setupManagerLeaveApprovalReminderScheduler(
      MANAGER_LEAVE_APPROVAL_REMINDER_CRON_JOB
    );
    console.log(
      "Manager Leave Approval Reminder scheduler set up for the 25th of every month"
    );
  } else {
    console.log(
      "Manager Leave Approval Reminder scheduler not set up: Missing cron expression"
    );
  }

  if (LEAVE_PLAN_UPDATE_REMINDER_CRON_JOB) {
    setupLeavePlanUpdateReminderScheduler(LEAVE_PLAN_UPDATE_REMINDER_CRON_JOB);
    console.log(
      "Leave Plan Update Reminder scheduler set up for the last day of every month"
    );
  } else {
    console.log(
      "Leave Plan Update Reminder scheduler not set up: Missing cron expression"
    );
  }

  console.log("All schedulers have been set up successfully.");
} else {
  console.log(
    'Schedulers are disabled. Set ENABLE_SCHEDULERS to "true" in .env to enable them.'
  );
}
httpServer.listen(port, host, () => {
  console.log(`ERP hrms API App Listening on Port http://${host}:${port}`);
});
