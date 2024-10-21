import axios from "axios";
import * as employeeService from "./employee.services";
import ExcelService from "../reports/excel/leavePlanReport";
import mailServices from "./mail.services";
import { format } from "date-fns";
import sharePointUploadService from "../utils/sharepointUpload";
import SharePointService from "../utils/sharepointUpload";
const excelService = new ExcelService();
interface Employee {
  employee: string;
  aalam_id: string;
  employee_name: string;
  department: string;
}
const getLeavePlan = async (body: any) => {
  try {
    const response = await axios.get(
      `${process.env.FRAPPE_URL}/api/resource/Leave Plan`, // Use the appropriate endpoint for attendance details
      {
        headers: {
          Authorization: `token ${process.env.FRAPPE_API_KEY}:${process.env.FRAPPE_API_SECRET}`, // Set the API token from environment variables
        },
        params: {
          fields: JSON.stringify([
            "employee",
            "status",
            "employee.aalam_id", // Accessing aalam_id from the Employee Doctype
            "employee.employee_name",
            "employee.date_of_joining",
            "`tabLeave Plan Date Range`.from_date",
            "`tabLeave Plan Date Range`.to_date",
            "`tabLeave Plan Date Range`.leave_type",
          ]), // Specify the fields to fetch from Attendance
          filters: JSON.stringify([
            // [
            //   "leave_plan_date_range.from_date",
            //   "between",
            //   [body?.startDate, body?.endDate],
            // ],
            // ["status", "in", ["On Leave", "Half Day"]],
            // ["leave_type", "is", "set"],
          ]),
          order_by: "date_of_joining asc ,aalam_id asc ",
          limit_page_length: 0, // Fetch all records (you can set a limit if needed)
        },
      }
    );
    const leavePlans = response.data.data;
    const filteredData = leavePlans.filter((item: any) => {
      const itemDate = item.from_date;
      return itemDate >= body.startDate && itemDate <= body?.endDate;
    });
    return filteredData; // Return the data containing attendance details
  } catch (error) {
    console.error("Error fetching getLeavePlan details:", error);
    throw error;
  }
};
const getLeaveReport = async (body: any) => {
  try {
    const { startDate, endDate } = body;
    const baseOutputPath = "./uploads/";
    // Fetch leave plan data
    const leavePlan = await getLeavePlan(body);
    if (!leavePlan || leavePlan.length === 0) {
      return {
        status: false,
        message: "No leave plan data found for the specified date range.",
      };
    }
    // Fetch employee data
    const employeeData = await employeeService.employeeList();
    if (!employeeData?.data?.data) {
      return {
        status: false,
        message: "Failed to fetch employee data.",
      };
    }
    const employeeList: Employee[] = employeeData.data.data;

    // Generate pivot data
    const pivotData: PivotData = getPivotData(leavePlan);

    // Generate Excel report
    const excelBuffer = await excelService.generateLeaveReport(
      pivotData,
      employeeList,
      startDate,
      endDate,
      baseOutputPath
    );

    if (!excelBuffer) {
      return {
        status: false,
        message: "Failed to generate Excel report.",
      };
    }

    // Send email
    try {
      await mailServices.sendLeavePlanEmail({
        start_date: new Date(startDate),
        buffer: excelBuffer,
      });
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      // Continue execution even if email fails
    }

    // Upload to SharePoint

    try {
      const sharePointService = new SharePointService(); // Instantiate the SharePointService
      const fileName = `LeavePlanReport_${format(
        new Date(startDate),
        "MMM"
      )}.xlsx`;
      const year = new Date(startDate).getFullYear().toString();
      console.log("year", year);

      const uploadResult = await sharePointService.uploadFile(
        excelBuffer as Buffer,
        fileName, // Add the appropriate SharePoint folder path here
        `/aalam_leave_plan/2024`
      );
      if (uploadResult.status) {
        console.log(
          "Successfully uploaded report to SharePoint:",
          uploadResult.message
        );
      } else {
        console.error(
          "Failed to upload report to SharePoint:",
          uploadResult.message
        );
      }
    } catch (uploadError) {
      console.error("Error uploading to SharePoint:", uploadError);
      // Continue execution even if upload fails
    }

    return {
      status: true,
      message: "Leave Plan report generated successfully",
      // data: excelBuffer,
    };
  } catch (error) {
    console.error("Error in getLeaveReport:", error);
    return {
      status: false,
      message: "An error occurred while generating the Leave Plan report.",
    };
  }
};

interface Leave {
  employee: string;
  aalam_id: string;
  employee_name: string;
  from_date: string;
  to_date: string;
  leave_type: string;
}
// Pivoted Leave Interface
interface PivotedLeave {
  aalam_id: string;
  employee_name: string;
  leaves: Leave[]; // Changed to Leave[] to match leave interface
}

type PivotData = Record<string, PivotedLeave>;
const getPivotData = (leavePlans: Leave[]): PivotData => {
  const pivotData: PivotData = {};

  leavePlans.forEach((leave) => {
    const {
      employee,
      aalam_id,
      employee_name,
      from_date,
      to_date,
      leave_type,
    } = leave;

    // Initialize employee data if not present
    if (!pivotData[employee]) {
      pivotData[employee] = {
        aalam_id,
        employee_name,
        leaves: [],
      };
    }

    // Push leave details into the employee's leave array
    pivotData[employee].leaves.push({
      from_date,
      to_date,
      leave_type,
      employee,
      employee_name,
      aalam_id,
    });
  });

  return pivotData;
};
export { getLeavePlan, getLeaveReport };
