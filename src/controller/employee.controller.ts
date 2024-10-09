import catchAsync from "../utils/catchAsync";
import * as employeeService from "../services/employee.services";
import { handleError, ErrorHandler } from "../config/error";

const errorText = "Error";

const employeeList = catchAsync(async (req, res) => {
  const methodName = "/userLogin";
  try {
    const auth = await employeeService.employeeList();
    res.send(auth);
  } catch (err: any) {
    handleError(new ErrorHandler(errorText, methodName, err), res);
  }
});

export { employeeList };
