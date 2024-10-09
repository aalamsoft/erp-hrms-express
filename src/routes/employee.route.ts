import express, { Request, Response } from "express";
import { employeeList } from "../controller/employee.controller";
import ExcelService from "../reports/excel/leavePlanReport";
const obj = require("../dummy.ts");
const router = express.Router();
const excelService = new ExcelService();

router.get("/getAll", employeeList);
router.get("/generate-excel", async (req: Request, res: Response) => {
  console.log("obj", obj?.obj);

  const { leaveData, employeeData, startDate, endDate } = obj?.obj;
  const baseOutputPath = "D:/Jegan/aalam-hrms/erp-hrms-express2/uploads/";
  try {
    const excelBuffer = await excelService.generateLeaveReport(
      leaveData,
      employeeData,
      startDate,
      endDate,
      baseOutputPath
    );

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="leave-report.xlsx"'
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.send(excelBuffer);
  } catch (error) {
    console.error("Error generating Excel report:", error);
    res.status(500).json({ message: "Error generating Excel report" });
  }
});

export default router;
