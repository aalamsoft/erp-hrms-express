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
exports.getLeaveReport = exports.getLeavePlan = void 0;
const axios_1 = __importDefault(require("axios"));
const employeeService = __importStar(require("./employee.services"));
const leavePlanReport_1 = __importDefault(require("../reports/excel/leavePlanReport"));
const mail_services_1 = __importDefault(require("./mail.services"));
const date_fns_1 = require("date-fns");
const sharepointUpload_1 = __importDefault(require("../utils/sharepointUpload"));
const excelService = new leavePlanReport_1.default();
const getLeavePlan = (body) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.get(`${process.env.FRAPPE_URL}/api/resource/Leave Plan`, // Use the appropriate endpoint for attendance details
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
        });
        const leavePlans = response.data.data;
        const filteredData = leavePlans.filter((item) => {
            const itemDate = item.from_date;
            return itemDate >= body.startDate && itemDate <= (body === null || body === void 0 ? void 0 : body.endDate);
        });
        return filteredData; // Return the data containing attendance details
    }
    catch (error) {
        console.error("Error fetching getLeavePlan details:", error);
        throw error;
    }
});
exports.getLeavePlan = getLeavePlan;
const getLeaveReport = (body) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { startDate, endDate } = body;
        const baseOutputPath = "./uploads/";
        // Fetch leave plan data
        const leavePlan = yield getLeavePlan(body);
        if (!leavePlan || leavePlan.length === 0) {
            return {
                status: false,
                message: "No leave plan data found for the specified date range.",
            };
        }
        // Fetch employee data
        const employeeData = yield employeeService.employeeList();
        if (!((_a = employeeData === null || employeeData === void 0 ? void 0 : employeeData.data) === null || _a === void 0 ? void 0 : _a.data)) {
            return {
                status: false,
                message: "Failed to fetch employee data.",
            };
        }
        const employeeList = employeeData.data.data;
        // Generate pivot data
        const pivotData = getPivotData(leavePlan);
        // Generate Excel report
        const excelBuffer = yield excelService.generateLeaveReport(pivotData, employeeList, startDate, endDate, baseOutputPath);
        if (!excelBuffer) {
            return {
                status: false,
                message: "Failed to generate Excel report.",
            };
        }
        // Send email
        try {
            yield mail_services_1.default.sendLeavePlanEmail({
                start_date: new Date(startDate),
                buffer: excelBuffer,
            });
        }
        catch (emailError) {
            console.error("Error sending email:", emailError);
            // Continue execution even if email fails
        }
        // Upload to SharePoint
        try {
            const sharePointService = new sharepointUpload_1.default(); // Instantiate the SharePointService
            const fileName = `LeavePlanReport_${(0, date_fns_1.format)(new Date(startDate), "MMM")}.xlsx`;
            const year = new Date(startDate).getFullYear().toString();
            console.log("year", year);
            const uploadResult = yield sharePointService.uploadFile(excelBuffer, fileName, // Add the appropriate SharePoint folder path here
            `/aalam_leave_plan/2024`);
            if (uploadResult.status) {
                console.log("Successfully uploaded report to SharePoint:", uploadResult.message);
            }
            else {
                console.error("Failed to upload report to SharePoint:", uploadResult.message);
            }
        }
        catch (uploadError) {
            console.error("Error uploading to SharePoint:", uploadError);
            // Continue execution even if upload fails
        }
        return {
            status: true,
            message: "Leave Plan report generated successfully",
            // data: excelBuffer,
        };
    }
    catch (error) {
        console.error("Error in getLeaveReport:", error);
        return {
            status: false,
            message: "An error occurred while generating the Leave Plan report.",
        };
    }
});
exports.getLeaveReport = getLeaveReport;
const getPivotData = (leavePlans) => {
    const pivotData = {};
    leavePlans.forEach((leave) => {
        const { employee, aalam_id, employee_name, from_date, to_date, leave_type, } = leave;
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
