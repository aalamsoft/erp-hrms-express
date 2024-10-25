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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const employee_controller_1 = require("../controller/employee.controller");
const leavePlanReport_1 = __importDefault(require("../reports/excel/leavePlanReport"));
const obj = require("../dummy.ts");
const router = express_1.default.Router();
const excelService = new leavePlanReport_1.default();
router.get("/getAll", employee_controller_1.employeeList);
router.get("/generate-excel", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("obj", obj === null || obj === void 0 ? void 0 : obj.obj);
    const { leaveData, employeeData, startDate, endDate } = obj === null || obj === void 0 ? void 0 : obj.obj;
    const baseOutputPath = "D:/Jegan/aalam-hrms/erp-hrms-express2/uploads/";
    try {
        const excelBuffer = yield excelService.generateLeaveReport(leaveData, employeeData, startDate, endDate, baseOutputPath);
        res.setHeader("Content-Disposition", 'attachment; filename="leave-report.xlsx"');
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.send(excelBuffer);
    }
    catch (error) {
        console.error("Error generating Excel report:", error);
        res.status(500).json({ message: "Error generating Excel report" });
    }
}));
exports.default = router;
