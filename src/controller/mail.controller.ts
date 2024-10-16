import catchAsync from "../utils/catchAsync";
import mailService from "../services/mail.services";
import { handleError, ErrorHandler } from "../config/error";
const errorText = "Error";

const leavePlanMail = catchAsync(async (req, res) => {
  const methodName = "/leavePlanmail";
  try {
    const email = await mailService.sendLeavePlanEmail(req.body);
    res.send(email);
  } catch (err: any) {
    handleError(new ErrorHandler(errorText, methodName, err), res);
  }
});
const leavePlanUpdateReminder = catchAsync(async (req, res) => {
  const methodName = "/leavePlanUpdateReminder";
  try {
    const email = await mailService.sendLeavePlanUpdateReminder(req.body);
    res.send(email);
  } catch (err: any) {
    handleError(new ErrorHandler(errorText, methodName, err), res);
  }
});
const managerLeaveApprovalReminder = catchAsync(async (req, res) => {
  const methodName = "/managerLeaveApprovalReminder";
  try {
    const email = await mailService.sendManagerLeaveApprovalReminder(req.body);
    res.send(email);
  } catch (err: any) {
    handleError(new ErrorHandler(errorText, methodName, err), res);
  }
});

export { leavePlanMail, leavePlanUpdateReminder, managerLeaveApprovalReminder };
