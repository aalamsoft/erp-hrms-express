"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.employeeList = void 0;
const axios = require("axios");
// Fetch employees from Frappe
const employeeList = () => __awaiter(void 0, void 0, void 0, function* () {
    const url = `${process.env.FRAPPE_URL}/api/resource/Employee`;
    const headers = {
        Authorization: `token ${process.env.FRAPPE_API_KEY}:${process.env.FRAPPE_API_SECRET}`,
        "Content-Type": "application/json",
    };
    const params = {
        fields: JSON.stringify([
            "employee",
            "status",
            "aalam_id", // Accessing aalam_id from the Employee Doctype
            "employee_name",
            "date_of_joining",
            "department",
        ]), // Specify the fields to fetch from Attendance
        filters: JSON.stringify([
            ["status", "in", ["Active"]],
            [
                "department",
                "in",
                [
                    "Accounts - AISL",
                    "Human Resources - AISL",
                    "Development Team - AISL",
                    "IT - AISL",
                ],
            ],
            ["aalam_id", "is", "set"],
        ]),
        order_by: "date_of_joining asc ,aalam_id asc ",
        limit_page_length: 0, // Fetch all records (you can set a limit if needed)
    };
    try {
        const response = yield axios.get(url, { headers, params });
        return {
            status: true,
            message: "Employee list is collected successfully",
            data: response.data,
        }; // Return the employee data
    }
    catch (error) {
        // Handle errors here
        console.error("Error fetching employee data:", error.message);
        // You can throw the error or return a custom error object
        throw new Error(`Failed to fetch employee data: ${error.message}`);
    }
});
exports.employeeList = employeeList;
