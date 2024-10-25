"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const exceljs_1 = __importDefault(require("exceljs"));
const date_fns_1 = require("date-fns");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class ExcelService {
    generateDateSeries(start, end) {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const dateArray = [];
        for (let dt = startDate; dt <= endDate; dt.setDate(dt.getDate() + 1)) {
            dateArray.push((0, date_fns_1.format)(dt, "EEEE, d MMMM, yyyy"));
        }
        return dateArray;
    }
    generateCellStyle(leaveType) {
        const style = Object.assign({}, ExcelService.CELL_STYLE);
        const colorMap = {
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
    generateLeaveReport(leaveData, employeeData, startDate, endDate, baseOutputPath) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const workbook = new exceljs_1.default.Workbook();
                this.createAllSheet(workbook, leaveData, employeeData, startDate, endDate);
                this.createSummarySheet(workbook, leaveData, employeeData, startDate, endDate);
                const buffer = (yield workbook.xlsx.writeBuffer());
                const filePath = this.saveExcelFile(buffer, startDate, baseOutputPath);
                return buffer;
            }
            catch (error) {
                console.error(`Error processing Excel report: ${error.message}`);
                return `Failure: Could not complete report processing. Error: ${error.message}`;
            }
        });
    }
    createAllSheet(workbook, leaveData, employeeData, startDate, endDate) {
        const allWorksheet = workbook.addWorksheet("All Employees");
        const month = (0, date_fns_1.format)(new Date(startDate), "MMMM yyyy");
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
    createSummarySheet(workbook, leaveData, employeeData, startDate, endDate) {
        const summaryWorksheet = workbook.addWorksheet("Summary");
        const month = (0, date_fns_1.format)(new Date(startDate), "MMMM yyyy");
        this.addTitleRows(summaryWorksheet, month);
        const headers = ["Date", "Total WFH", "Total Leave", "Total WFO"];
        this.addHeaderRow(summaryWorksheet, headers);
        this.addSummaryRows(summaryWorksheet, leaveData, employeeData, startDate, endDate);
        this.formatWorksheet(summaryWorksheet);
    }
    addTitleRows(worksheet, month) {
        const titleRow = worksheet.addRow([`Leave Plan for the Month of ${month}`]);
        titleRow.height = 30;
        titleRow.eachCell((cell) => {
            cell.style = ExcelService.TITLE_STYLE;
        });
        worksheet.mergeCells(`A${titleRow.number}:${this.getColumnName(worksheet.columnCount)}${titleRow.number}`);
        const subtitleRow = worksheet.addRow(["Aalam Info Solutions LLP"]);
        subtitleRow.height = 25;
        subtitleRow.eachCell((cell) => {
            cell.style = ExcelService.SUBTITLE_STYLE;
        });
        worksheet.mergeCells(`A${subtitleRow.number}:${this.getColumnName(worksheet.columnCount)}${subtitleRow.number}`);
        worksheet.addRow([]); // Add an empty row for spacing
    }
    addHeaderRow(worksheet, headers) {
        const headerRow = worksheet.addRow(headers);
        headerRow.height = 20;
        headerRow.eachCell((cell) => {
            cell.style = ExcelService.HEADER_STYLE;
        });
    }
    addDataRows(worksheet, leaveData, employeeData, startDate, endDate) {
        const dateSeries = this.generateDateSeries(startDate, endDate);
        dateSeries.forEach((date) => {
            const rowData = [(0, date_fns_1.format)(new Date(date), "EEEE, d MMMM, yyyy")];
            let totalWFH = 0, totalLeave = 0;
            employeeData.forEach((employee) => {
                var _a;
                const leaveType = this.getLeaveTypeForDate(((_a = leaveData[employee.employee]) === null || _a === void 0 ? void 0 : _a.leaves) || [], date);
                rowData.push(leaveType);
                if (leaveType === "WFH")
                    totalWFH++;
                else if (["Leave", "First Half Leave", "Second Half Leave"].includes(leaveType))
                    totalLeave++;
            });
            const totalWFO = employeeData.length - (totalWFH + totalLeave);
            rowData.push(totalWFH.toString(), totalLeave.toString(), totalWFO.toString());
            const newRow = worksheet.addRow(rowData);
            this.styleDataRow(newRow, employeeData.length);
        });
    }
    addSummaryRows(worksheet, leaveData, employeeData, startDate, endDate) {
        const dateSeries = this.generateDateSeries(startDate, endDate);
        dateSeries.forEach((date) => {
            let totalWFH = 0, totalLeave = 0;
            employeeData.forEach((employee) => {
                var _a;
                const leaveType = this.getLeaveTypeForDate(((_a = leaveData[employee.employee]) === null || _a === void 0 ? void 0 : _a.leaves) || [], date);
                if (leaveType === "WFH")
                    totalWFH++;
                else if (["Leave", "First Half Leave", "Second Half Leave"].includes(leaveType))
                    totalLeave++;
            });
            const totalWFO = employeeData.length - (totalWFH + totalLeave);
            worksheet.addRow([
                (0, date_fns_1.format)(new Date(date), "EEEE, d MMMM, yyyy"),
                totalWFH.toString(),
                totalLeave.toString(),
                totalWFO.toString(),
            ]);
        });
    }
    getLeaveTypeForDate(leaves, date) {
        var _a;
        return (((_a = leaves.find((leave) => this.generateDateSeries(leave.from_date, leave.to_date).includes(date))) === null || _a === void 0 ? void 0 : _a.leave_type) || "");
    }
    styleDataRow(row, employeeCount) {
        row.eachCell((cell, colNumber) => {
            if (colNumber > 1 && colNumber <= employeeCount + 1) {
                cell.style = this.generateCellStyle(cell.value);
            }
            else {
                cell.style = ExcelService.CELL_STYLE;
            }
        });
    }
    formatWorksheet(worksheet) {
        worksheet.columns.forEach((column, index) => {
            if (index === 0) {
                column.width = 30; // Date column
            }
            else {
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
    getColumnName(index) {
        let columnName = "";
        while (index > 0) {
            index--;
            columnName = String.fromCharCode(65 + (index % 26)) + columnName;
            index = Math.floor(index / 26);
        }
        return columnName;
    }
    saveExcelFile(buffer, startDate, baseOutputPath) {
        const start = new Date(startDate);
        const year = start.getFullYear();
        const month = (0, date_fns_1.format)(start, "MMM");
        const dirPath = path.join(baseOutputPath, year.toString(), month);
        fs.mkdirSync(dirPath, { recursive: true });
        const filePath = path.join(dirPath, `${month}_leave_report.xlsx`);
        fs.writeFileSync(filePath, buffer);
        console.log(`Excel report saved to: ${filePath}`);
        return filePath;
    }
}
ExcelService.TITLE_STYLE = {
    font: {
        name: "Calibri",
        size: 16,
        bold: true,
        color: { argb: "FF000000" },
    },
    alignment: { vertical: "middle", horizontal: "center" },
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFD9E1F2" } },
};
ExcelService.SUBTITLE_STYLE = {
    font: {
        name: "Calibri",
        size: 14,
        bold: true,
        color: { argb: "FF000000" },
    },
    alignment: { vertical: "middle", horizontal: "center" },
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFE9EDF5" } },
};
ExcelService.HEADER_STYLE = {
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
ExcelService.CELL_STYLE = {
    font: { name: "Calibri", size: 11 },
    alignment: { vertical: "middle", horizontal: "center" },
    border: {
        top: { style: "thin", color: { argb: "FF000000" } },
        left: { style: "thin", color: { argb: "FF000000" } },
        bottom: { style: "thin", color: { argb: "FF000000" } },
        right: { style: "thin", color: { argb: "FF000000" } },
    },
};
exports.default = ExcelService;
