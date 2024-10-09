import ExcelJS from "exceljs";
import { format } from "date-fns";
import { Buffer } from "buffer";
import * as fs from "fs";
import * as path from "path";
import mailServices from "../../services/mail.services";
import { getSharePointAccessToken } from "../../utils/sharepointAccess";
import SharePointService, * as uploadService from "../../utils/sharepointUpload";
export interface Leave {
  employee: string;
  aalam_id: string;
  employee_name: string;
  from_date: string;
  to_date: string;
  leave_type: string;
}

export interface Employee {
  employee: string;
  aalam_id: string;
  employee_name: string;
  department: string;
}

class ExcelService {
  private generateDateSeries(start: string, end: string): string[] {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const dateArray: string[] = [];

    for (let dt = startDate; dt <= endDate; dt.setDate(dt.getDate() + 1)) {
      dateArray.push(format(dt, "EEEE, d MMMM, yyyy"));
    }

    return dateArray;
  }

  private generateCellStyle(leaveType: string): ExcelJS.Style {
    const baseStyle: ExcelJS.Style = {
      numFmt: "General",
      font: {
        name: "Arial",
        size: 10,
        bold: false,
        italic: false,
        underline: false,
        color: { argb: "FF000000" },
      },
      alignment: {
        vertical: "middle",
        horizontal: "center",
      },
      protection: { locked: false },
      border: {
        top: { style: "thin", color: { argb: "FF000000" } },
        left: { style: "thin", color: { argb: "FF000000" } },
        bottom: { style: "thin", color: { argb: "FF000000" } },
        right: { style: "thin", color: { argb: "FF000000" } },
      },
      fill: { type: "pattern", pattern: "none" },
    };

    switch (leaveType) {
      case "WFH":
        baseStyle.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF99FF99" },
        };
        break;
      case "Leave":
        baseStyle.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFF9999" },
        };
        break;
      case "First Half Leave":
        baseStyle.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFCCCCFF" },
        };
        break;
      case "Second Half Leave":
        baseStyle.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFFCC99" },
        };
        break;
      default:
        break;
    }

    return baseStyle;
  }

  // public async generateLeaveReport(
  //   leaveData: Record<string, { leaves: Leave[] }>,
  //   employeeData: Employee[],
  //   startDate: string,
  //   endDate: string,
  //   baseOutputPath: string
  // ): Promise<Buffer> {
  //   const workbook = new ExcelJS.Workbook();

  //   // Create the first sheet with all leave data
  //   const allWorksheet = workbook.addWorksheet("All");

  //   // Set headers for All sheet and style them
  //   const headers = [
  //     "Date",
  //     ...(employeeData?.map((emp) => emp.employee_name) || []),
  //     "Total WFH",
  //     "Total Leave",
  //     "Total WFO",
  //   ];
  //   const headerRow = allWorksheet.addRow(headers);

  //   // Apply header style
  //   headerRow?.eachCell((cell) => {
  //     cell.style = {
  //       font: {
  //         name: "Arial",
  //         size: 11,
  //         bold: true,
  //         color: { argb: "FFFFFFFF" },
  //       },
  //       alignment: { vertical: "middle", horizontal: "center" },
  //       fill: {
  //         type: "pattern",
  //         pattern: "solid",
  //         fgColor: { argb: "FF4F81BD" }, // Blue background
  //       },
  //       border: {
  //         top: { style: "thin", color: { argb: "FF000000" } },
  //         left: { style: "thin", color: { argb: "FF000000" } },
  //         bottom: { style: "thin", color: { argb: "FF000000" } },
  //         right: { style: "thin", color: { argb: "FF000000" } },
  //       },
  //     };
  //   });

  //   const dateSeries = this.generateDateSeries(startDate, endDate);
  //   console.log("Date Series:", dateSeries); // Debugging line

  //   // Add data rows for All sheet
  //   dateSeries.forEach((date) => {
  //     const rowData = [format(new Date(date), "EEEE, d MMMM, yyyy")];
  //     let totalWFH = 0;
  //     let totalLeave = 0;

  //     employeeData?.forEach((employee) => {
  //       const employeeLeaves = leaveData[employee.employee]?.leaves || [];
  //       console.log(`Employee: ${employee.employee}, Leaves:`, employeeLeaves); // Debugging line

  //       const leaveOnDate = employeeLeaves.find((leave) => {
  //         const dates = this.generateDateSeries(leave.from_date, leave.to_date);
  //         return dates.includes(date);
  //       });

  //       const leaveType = leaveOnDate ? leaveOnDate.leave_type : "";
  //       rowData.push(leaveType || "");

  //       if (leaveType === "WFH") {
  //         totalWFH++;
  //       } else if (
  //         leaveType === "Leave" ||
  //         leaveType === "First Half Leave" ||
  //         leaveType === "Second Half Leave"
  //       ) {
  //         totalLeave++;
  //       }
  //     });

  //     const totalWFO = employeeData.length - (totalWFH + totalLeave);
  //     rowData.push(
  //       totalWFH.toString(),
  //       totalLeave.toString(),
  //       totalWFO.toString()
  //     );

  //     const newRow = allWorksheet.addRow(rowData);

  //     newRow.eachCell((cell, colNumber) => {
  //       if (colNumber > 1 && colNumber <= employeeData.length + 1) {
  //         const leaveType = rowData[colNumber - 1];
  //         cell.style = this.generateCellStyle(leaveType);
  //       }
  //     });
  //   });

  //   // Create the second sheet with summary data
  //   const summaryWorksheet = workbook.addWorksheet("HR");

  //   const summaryHeaders = ["Date", "Total WFH", "Total Leave", "Total WFO"];
  //   const summaryHeaderRow = summaryWorksheet.addRow(summaryHeaders);

  //   // Apply header style to summary sheet
  //   summaryHeaderRow.eachCell((cell) => {
  //     cell.style = {
  //       font: {
  //         name: "Arial",
  //         size: 11,
  //         bold: true,
  //         color: { argb: "FFFFFFFF" },
  //       },
  //       alignment: { vertical: "middle", horizontal: "center" },
  //       fill: {
  //         type: "pattern",
  //         pattern: "solid",
  //         fgColor: { argb: "FF4F81BD" }, // Blue background
  //       },
  //       border: {
  //         top: { style: "thin", color: { argb: "FF000000" } },
  //         left: { style: "thin", color: { argb: "FF000000" } },
  //         bottom: { style: "thin", color: { argb: "FF000000" } },
  //         right: { style: "thin", color: { argb: "FF000000" } },
  //       },
  //     };
  //   });

  //   dateSeries.forEach((date) => {
  //     let totalWFH = 0;
  //     let totalLeave = 0;

  //     employeeData.forEach((employee) => {
  //       const employeeLeaves = leaveData[employee.employee]?.leaves || [];
  //       employeeLeaves.forEach((leave) => {
  //         const dates = this.generateDateSeries(leave.from_date, leave.to_date);
  //         if (dates.includes(date)) {
  //           const leaveType = leave.leave_type;
  //           if (leaveType === "WFH") {
  //             totalWFH++;
  //           } else if (
  //             leaveType === "Leave" ||
  //             leaveType === "First Half Leave" ||
  //             leaveType === "Second Half Leave"
  //           ) {
  //             totalLeave++;
  //           }
  //         }
  //       });
  //     });

  //     const totalWFO = employeeData.length - (totalWFH + totalLeave);
  //     summaryWorksheet.addRow([
  //       format(new Date(date), "EEEE, d MMMM, yyyy"),
  //       totalWFH.toString(),
  //       totalLeave.toString(),
  //       totalWFO.toString(),
  //     ]);
  //   });

  //   const arrayBuffer = await workbook.xlsx.writeBuffer();
  //   // Convert ArrayBuffer to Node.js Buffer
  //   const buffer = Buffer.from(arrayBuffer);
  //   const start = new Date(startDate);
  //   const year = start.getFullYear();
  //   // Format the month to be abbreviated (e.g., 'Oct' for October)
  //   const month = format(start, "MMM"); // Months are 0-indexed

  //   // Create the folder structure based on year and month
  //   const dirPath = path.join(baseOutputPath, year.toString(), month);

  //   // Ensure the output directory exists
  //   if (!fs.existsSync(dirPath)) {
  //     fs.mkdirSync(dirPath, { recursive: true });
  //     console.log(`Created directory: ${dirPath}`);
  //   } else {
  //     console.log(`Directory already exists: ${dirPath}`);
  //   }
  //   // Construct the full output path for the file
  //   const outputPath = path.join(dirPath, `${month}_leave_report.xlsx`);
  //   // Write the buffer to a file
  //   fs.writeFileSync(outputPath, buffer);
  //   console.log(`Excel report saved to: ${outputPath}`);

  //   return buffer;
  // }
  public async generateLeaveReport(
    leaveData: Record<string, { leaves: Leave[] }>,
    employeeData: Employee[],
    startDate: string,
    endDate: string,
    baseOutputPath: string
  ): Promise<string> {
    const workbook = new ExcelJS.Workbook();

    // Create the first sheet with all leave data
    const allWorksheet = workbook.addWorksheet("All");

    // Set headers for All sheet and style them
    const headers = [
      "Date",
      ...(employeeData?.map((emp) => emp.employee_name) || []),
      "Total WFH",
      "Total Leave",
      "Total WFO",
    ];
    const headerRow = allWorksheet.addRow(headers);

    // Apply header style
    headerRow?.eachCell((cell) => {
      cell.style = {
        font: {
          name: "Arial",
          size: 11,
          bold: true,
          color: { argb: "FFFFFFFF" },
        },
        alignment: { vertical: "middle", horizontal: "center" },
        fill: {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF4F81BD" }, // Blue background
        },
        border: {
          top: { style: "thin", color: { argb: "FF000000" } },
          left: { style: "thin", color: { argb: "FF000000" } },
          bottom: { style: "thin", color: { argb: "FF000000" } },
          right: { style: "thin", color: { argb: "FF000000" } },
        },
      };
    });

    const dateSeries = this.generateDateSeries(startDate, endDate);
    // Add data rows for All sheet
    dateSeries.forEach((date) => {
      const rowData = [format(new Date(date), "EEEE, d MMMM, yyyy")];
      let totalWFH = 0;
      let totalLeave = 0;

      employeeData?.forEach((employee) => {
        const employeeLeaves = leaveData[employee.employee]?.leaves || [];
        const leaveOnDate = employeeLeaves.find((leave) => {
          const dates = this.generateDateSeries(leave.from_date, leave.to_date);
          return dates.includes(date);
        });

        const leaveType = leaveOnDate ? leaveOnDate.leave_type : "";
        rowData.push(leaveType || "");

        if (leaveType === "WFH") {
          totalWFH++;
        } else if (
          leaveType === "Leave" ||
          leaveType === "First Half Leave" ||
          leaveType === "Second Half Leave"
        ) {
          totalLeave++;
        }
      });

      const totalWFO = employeeData.length - (totalWFH + totalLeave);
      rowData.push(
        totalWFH.toString(),
        totalLeave.toString(),
        totalWFO.toString()
      );

      const newRow = allWorksheet.addRow(rowData);

      newRow.eachCell((cell, colNumber) => {
        if (colNumber > 1 && colNumber <= employeeData.length + 1) {
          const leaveType = rowData[colNumber - 1];
          cell.style = this.generateCellStyle(leaveType);
        }
      });
    });

    // Create the second sheet with summary data
    const summaryWorksheet = workbook.addWorksheet("HR");

    const summaryHeaders = ["Date", "Total WFH", "Total Leave", "Total WFO"];
    const summaryHeaderRow = summaryWorksheet.addRow(summaryHeaders);

    // Apply header style to summary sheet
    summaryHeaderRow.eachCell((cell) => {
      cell.style = {
        font: {
          name: "Arial",
          size: 11,
          bold: true,
          color: { argb: "FFFFFFFF" },
        },
        alignment: { vertical: "middle", horizontal: "center" },
        fill: {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF4F81BD" }, // Blue background
        },
        border: {
          top: { style: "thin", color: { argb: "FF000000" } },
          left: { style: "thin", color: { argb: "FF000000" } },
          bottom: { style: "thin", color: { argb: "FF000000" } },
          right: { style: "thin", color: { argb: "FF000000" } },
        },
      };
    });

    dateSeries.forEach((date) => {
      let totalWFH = 0;
      let totalLeave = 0;

      employeeData.forEach((employee) => {
        const employeeLeaves = leaveData[employee.employee]?.leaves || [];
        employeeLeaves.forEach((leave) => {
          const dates = this.generateDateSeries(leave.from_date, leave.to_date);
          if (dates.includes(date)) {
            const leaveType = leave.leave_type;
            if (leaveType === "WFH") {
              totalWFH++;
            } else if (
              leaveType === "Leave" ||
              leaveType === "First Half Leave" ||
              leaveType === "Second Half Leave"
            ) {
              totalLeave++;
            }
          }
        });
      });

      const totalWFO = employeeData.length - (totalWFH + totalLeave);
      summaryWorksheet.addRow([
        format(new Date(date), "EEEE, d MMMM, yyyy"),
        totalWFH.toString(),
        totalLeave.toString(),
        totalWFO.toString(),
      ]);
    });

    const arrayBuffer = await workbook.xlsx.writeBuffer();
    // Convert ArrayBuffer to Node.js Buffer
    const buffer = Buffer.from(arrayBuffer);
    const start = new Date(startDate);
    const year = start.getFullYear();
    // Format the month to be abbreviated (e.g., 'Oct' for October)
    const month = format(start, "MMM"); // Months are 0-indexed

    // Create the folder structure based on year and month
    const dirPath = path.join(baseOutputPath, year.toString(), month);

    // Ensure the output directory exists
    try {
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`Created directory: ${dirPath}`);
      } else {
        console.log(`Directory already exists: ${dirPath}`);
      }

      // Construct the full output path for the file
      const outputPath = path.join(dirPath, `${month}_leave_report.xlsx`);

      // Write the buffer to a file
      fs.writeFileSync(outputPath, buffer);
      console.log(`Excel report saved to: ${outputPath}`);
      // const emailObject = {
      //   start_date: start,
      //   buffer: buffer,
      // };
      // mailServices.sendLeavePlanEmail(emailObject);
      const sharePointService = new SharePointService();
      const siteId = "AalamInfoSolutinonsLLP"; // Change this to your SharePoint site ID
      const filePath = buffer;
      const fileName = `${month}_leave_report.xlsx`;
      try {
        // Fetch access token
        const sharePointUploadResult = await sharePointService.uploadFile(
          outputPath,
          fileName,
          siteId
        );

        console.log(
          `File uploaded to SharePoint successfully: ${sharePointUploadResult}`
        );
        return "Success: Excel report generated successfully."; // Return result or path to the uploaded file
      } catch (error) {
        console.error("Error uploading file to SharePoint:", error);
        throw new Error("Upload failed");
      }
      // const email = await mailServices.sendLeavePlanEmail(emailObject);
      return "Success: Excel report generated successfully.";
    } catch (error: any) {
      console.error(`Error saving Excel report: ${error.message}`);
      return `Failure: Could not generate the report. Error: ${error.message}`;
    }
  }
}

export default ExcelService;
