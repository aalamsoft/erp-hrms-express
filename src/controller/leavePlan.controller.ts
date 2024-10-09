import catchAsync from "../utils/catchAsync";
import * as employeeService from "../services/employee.services";
import { handleError, ErrorHandler } from "../config/error";
import * as leavePlanService from "../services/leavePlan.service";

const errorText = "Error";

const leavePlan = catchAsync(async (req, res) => {
  const methodName = "/leavePlan";
  try {
    const obj: any = {};
    const auth = await leavePlanService.getLeavePlan(obj);
    res.send(auth);
  } catch (err: any) {
    handleError(new ErrorHandler(errorText, methodName, err), res);
  }
});
const getLeaveReport = catchAsync(async (req, res) => {
  const methodName = "/leavePlan";
  try {
    const obj: any = {};
    const auth = await leavePlanService.getLeaveReport(req.body);
    res.send(auth);
  } catch (err: any) {
    handleError(new ErrorHandler(errorText, methodName, err), res);
  }
});

export { leavePlan, getLeaveReport };
