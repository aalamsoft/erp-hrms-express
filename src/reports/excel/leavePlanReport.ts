import ExcelJS from "exceljs";
import { format } from "date-fns";
import { Buffer } from "buffer";
import * as fs from "fs";
import * as path from "path";
import mailServices from "../../services/mail.services";

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
  private static readonly TITLE_STYLE: Partial<ExcelJS.Style> = {
    font: {
      name: "Calibri",
      size: 16,
      bold: true,
      color: { argb: "FF000000" },
    },
    alignment: { vertical: "middle", horizontal: "center" },
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFD9E1F2" } },
  };

  private static readonly SUBTITLE_STYLE: Partial<ExcelJS.Style> = {
    font: {
      name: "Calibri",
      size: 14,
      bold: true,
      color: { argb: "FF000000" },
    },
    alignment: { vertical: "middle", horizontal: "center" },
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFE9EDF5" } },
  };

  private static readonly HEADER_STYLE: Partial<ExcelJS.Style> = {
    font: {
      name: "Calibri",
      size: 12,
      bold: true,
      color: { argb: "FFFFFFFF" },
    },
    alignment: { vertical: "middle", horizontal: "center" },
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF4472C4" } },
    border: {
      top: { style: "thin", color: { argb: "FF000000" } },
      left: { style: "thin", color: { argb: "FF000000" } },
      bottom: { style: "thin", color: { argb: "FF000000" } },
      right: { style: "thin", color: { argb: "FF000000" } },
    },
  };

  private static readonly CELL_STYLE: Partial<ExcelJS.Style> = {
    font: { name: "Calibri", size: 11 },
    alignment: { vertical: "middle", horizontal: "center" },
    border: {
      top: { style: "thin", color: { argb: "FF000000" } },
      left: { style: "thin", color: { argb: "FF000000" } },
      bottom: { style: "thin", color: { argb: "FF000000" } },
      right: { style: "thin", color: { argb: "FF000000" } },
    },
  };

  private generateDateSeries(start: string, end: string): string[] {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const dateArray: string[] = [];

    for (let dt = startDate; dt <= endDate; dt.setDate(dt.getDate() + 1)) {
      dateArray.push(format(dt, "EEEE, d MMMM, yyyy"));
    }

    return dateArray;
  }

  private generateCellStyle(leaveType: string): Partial<ExcelJS.Style> {
    const style = { ...ExcelService.CELL_STYLE };
    const colorMap: { [key: string]: string } = {
      WFH: "FFE2EFDA",
      Leave: "FFFCE4D6",
      "First Half Leave": "FFE7E6E6",
      "Second Half Leave": "FFFFF2CC",
    };

    if (leaveType in colorMap) {
      style.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: colorMap[leaveType] },
      };
    }

    return style;
  }

  public async generateLeaveReport(
    leaveData: Record<string, { leaves: Leave[] }>,
    employeeData: Employee[],
    startDate: string,
    endDate: string,
    baseOutputPath: string
  ): Promise<Buffer | string> {
    try {
      const workbook = new ExcelJS.Workbook();
      this.createAllSheet(
        workbook,
        leaveData,
        employeeData,
        startDate,
        endDate
      );
      this.createSummarySheet(
        workbook,
        leaveData,
        employeeData,
        startDate,
        endDate
      );

      const buffer = (await workbook.xlsx.writeBuffer()) as Buffer;
      const filePath = this.saveExcelFile(buffer, startDate, baseOutputPath);
      return buffer;
    } catch (error: any) {
      console.error(`Error processing Excel report: ${error.message}`);
      return `Failure: Could not complete report processing. Error: ${error.message}`;
    }
  }

  private createAllSheet(
    workbook: ExcelJS.Workbook,
    leaveData: Record<string, { leaves: Leave[] }>,
    employeeData: Employee[],
    startDate: string,
    endDate: string
  ): void {
    const allWorksheet = workbook.addWorksheet("All Employees");
    const month = format(new Date(startDate), "MMMM yyyy");

    this.addTitleRows(allWorksheet, month);

    const headers = [
      "Date",
      ...employeeData.map((emp) => emp.employee_name),
      "Total WFH",
      "Total Leave",
      "Total WFO",
    ];

    this.addHeaderRow(allWorksheet, headers);
    this.addDataRows(allWorksheet, leaveData, employeeData, startDate, endDate);
    this.formatWorksheet(allWorksheet);
  }

  private createSummarySheet(
    workbook: ExcelJS.Workbook,
    leaveData: Record<string, { leaves: Leave[] }>,
    employeeData: Employee[],
    startDate: string,
    endDate: string
  ): void {
    const summaryWorksheet = workbook.addWorksheet("Summary");
    const month = format(new Date(startDate), "MMMM yyyy");

    this.addTitleRows(summaryWorksheet, month);

    const headers = ["Date", "Total WFH", "Total Leave", "Total WFO"];

    this.addHeaderRow(summaryWorksheet, headers);
    this.addSummaryRows(
      summaryWorksheet,
      leaveData,
      employeeData,
      startDate,
      endDate
    );
    this.formatWorksheet(summaryWorksheet);
  }

  private addTitleRows(worksheet: ExcelJS.Worksheet, month: string): void {
    const titleRow = worksheet.addRow([`Leave Plan for the Month of ${month}`]);
    titleRow.height = 30;
    titleRow.eachCell((cell) => {
      cell.style = ExcelService.TITLE_STYLE;
    });
    worksheet.mergeCells(
      `A${titleRow.number}:${this.getColumnName(worksheet.columnCount)}${
        titleRow.number
      }`
    );

    const subtitleRow = worksheet.addRow(["Aalam Info Solutions LLP"]);
    subtitleRow.height = 25;
    subtitleRow.eachCell((cell) => {
      cell.style = ExcelService.SUBTITLE_STYLE;
    });
    worksheet.mergeCells(
      `A${subtitleRow.number}:${this.getColumnName(worksheet.columnCount)}${
        subtitleRow.number
      }`
    );

    worksheet.addRow([]); // Add an empty row for spacing
  }

  private addHeaderRow(worksheet: ExcelJS.Worksheet, headers: string[]): void {
    const headerRow = worksheet.addRow(headers);
    headerRow.height = 20;
    headerRow.eachCell((cell) => {
      cell.style = ExcelService.HEADER_STYLE;
    });
  }

  private addDataRows(
    worksheet: ExcelJS.Worksheet,
    leaveData: Record<string, { leaves: Leave[] }>,
    employeeData: Employee[],
    startDate: string,
    endDate: string
  ): void {
    const dateSeries = this.generateDateSeries(startDate, endDate);

    dateSeries.forEach((date) => {
      const rowData = [format(new Date(date), "EEEE, d MMMM, yyyy")];
      let totalWFH = 0,
        totalLeave = 0;

      employeeData.forEach((employee) => {
        const leaveType = this.getLeaveTypeForDate(
          leaveData[employee.employee]?.leaves || [],
          date
        );
        rowData.push(leaveType);
        if (leaveType === "WFH") totalWFH++;
        else if (
          ["Leave", "First Half Leave", "Second Half Leave"].includes(leaveType)
        )
          totalLeave++;
      });

      const totalWFO = employeeData.length - (totalWFH + totalLeave);
      rowData.push(
        totalWFH.toString(),
        totalLeave.toString(),
        totalWFO.toString()
      );

      const newRow = worksheet.addRow(rowData);
      this.styleDataRow(newRow, employeeData.length);
    });
  }

  private addSummaryRows(
    worksheet: ExcelJS.Worksheet,
    leaveData: Record<string, { leaves: Leave[] }>,
    employeeData: Employee[],
    startDate: string,
    endDate: string
  ): void {
    const dateSeries = this.generateDateSeries(startDate, endDate);

    dateSeries.forEach((date) => {
      let totalWFH = 0,
        totalLeave = 0;

      employeeData.forEach((employee) => {
        const leaveType = this.getLeaveTypeForDate(
          leaveData[employee.employee]?.leaves || [],
          date
        );
        if (leaveType === "WFH") totalWFH++;
        else if (
          ["Leave", "First Half Leave", "Second Half Leave"].includes(leaveType)
        )
          totalLeave++;
      });

      const totalWFO = employeeData.length - (totalWFH + totalLeave);
      worksheet.addRow([
        format(new Date(date), "EEEE, d MMMM, yyyy"),
        totalWFH.toString(),
        totalLeave.toString(),
        totalWFO.toString(),
      ]);
    });
  }

  private getLeaveTypeForDate(leaves: Leave[], date: string): string {
    return (
      leaves.find((leave) =>
        this.generateDateSeries(leave.from_date, leave.to_date).includes(date)
      )?.leave_type || ""
    );
  }

  private styleDataRow(row: ExcelJS.Row, employeeCount: number): void {
    row.eachCell((cell, colNumber) => {
      if (colNumber > 1 && colNumber <= employeeCount + 1) {
        cell.style = this.generateCellStyle(cell.value as string);
      } else {
        cell.style = ExcelService.CELL_STYLE;
      }
    });
  }

  private formatWorksheet(worksheet: ExcelJS.Worksheet): void {
    worksheet.columns.forEach((column, index) => {
      if (index === 0) {
        column.width = 30; // Date column
      } else {
        column.width = 15;
      }
    });

    // Add borders to all cells
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        if (rowNumber > 3) {
          // Skip title and subtitle rows
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        }
      });
    });
  }

  private getColumnName(index: number): string {
    let columnName = "";
    while (index > 0) {
      index--;
      columnName = String.fromCharCode(65 + (index % 26)) + columnName;
      index = Math.floor(index / 26);
    }
    return columnName;
  }

  private saveExcelFile(
    buffer: Buffer,
    startDate: string,
    baseOutputPath: string
  ): string {
    const start = new Date(startDate);
    const year = start.getFullYear();
    const month = format(start, "MMM");
    const dirPath = path.join(baseOutputPath, year.toString(), month);

    fs.mkdirSync(dirPath, { recursive: true });
    const filePath = path.join(dirPath, `${month}_leave_report.xlsx`);
    fs.writeFileSync(filePath, buffer);
    console.log(`Excel report saved to: ${filePath}`);

    return filePath;
  }
}

export default ExcelService;
