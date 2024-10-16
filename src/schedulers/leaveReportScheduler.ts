import { startOfMonth, endOfMonth, format } from "date-fns";
import * as leavePlanService from "../services/leavePlan.service";
import mailServices from "../services/mail.services";
const nodeCron = require("node-cron");

export function setupLeaveReportScheduler(cronExpression: string) {
  nodeCron.schedule(cronExpression, async function () {
    try {
      if (process.env.LEAVEPLAN_SCHEDULER === "0") {
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const startDate = format(
          startOfMonth(new Date(year, month)),
          "yyyy-MM-dd"
        );
        const endDate = format(endOfMonth(new Date(year, month)), "yyyy-MM-dd");

        const object = {
          startDate,
          endDate,
        };
        const generateLeaveReport = await leavePlanService.getLeaveReport(
          object
        );

        if (generateLeaveReport.status) {
          console.log(
            `Leave report generated successfully for ${format(
              currentDate,
              "MMMM yyyy"
            )}`
          );
        } else {
          console.log(
            `Failed to generate leave report for ${format(
              currentDate,
              "MMMM yyyy"
            )}:`,
            generateLeaveReport.message
          );
        }
      }
    } catch (error) {
      console.error("Error in LEAVEPLANREPORT_CRON_JOB:", error);
    }
  });
}

export function setupManagerLeaveApprovalReminderScheduler(
  cronExpression: string
) {
  nodeCron.schedule(cronExpression, async function () {
    try {
      if (process.env.MANAGER_LEAVE_APPROVAL_REMINDER_SCHEDULER === "0") {
        const bccList =
          process.env.GROUP_EMAIL?.split(",").map((email) => email.trim()) ||
          [];
        const result = await mailServices.sendManagerLeaveApprovalReminder({
          bccList,
        });
        if (result.status) {
          console.log("Manager leave approval reminders sent successfully");
        } else {
          console.log(
            "Failed to send manager leave approval reminders:",
            result.message
          );
        }
      }
    } catch (error) {
      console.error(
        "Error in MANAGER_LEAVE_APPROVAL_REMINDER_CRON_JOB:",
        error
      );
    }
  });
}

export function setupLeavePlanUpdateReminderScheduler(cronExpression: string) {
  nodeCron.schedule(cronExpression, async function () {
    try {
      if (process.env.LEAVE_PLAN_UPDATE_REMINDER_SCHEDULER === "0") {
        const bccList =
          process.env.GROUP_EMAIL?.split(",").map((email) => email.trim()) ||
          [];
        const result = await mailServices.sendLeavePlanUpdateReminder({
          bccList,
        });
        if (result.status) {
          console.log("Leave plan update reminders sent successfully");
        } else {
          console.log(
            "Failed to send leave plan update reminders:",
            result.message
          );
        }
      }
    } catch (error) {
      console.error("Error in LEAVE_PLAN_UPDATE_REMINDER_CRON_JOB:", error);
    }
  });
}
