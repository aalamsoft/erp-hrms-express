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
exports.managerLeaveApprovalReminder = exports.leavePlanUpdateReminder = exports.leavePlanMail = void 0;
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const mail_services_1 = __importDefault(require("../services/mail.services"));
const error_1 = require("../config/error");
const errorText = "Error";
const leavePlanMail = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const methodName = "/leavePlanmail";
    try {
        const email = yield mail_services_1.default.sendLeavePlanEmail(req.body);
        res.send(email);
    }
    catch (err) {
        (0, error_1.handleError)(new error_1.ErrorHandler(errorText, methodName, err), res);
    }
}));
exports.leavePlanMail = leavePlanMail;
const leavePlanUpdateReminder = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const methodName = "/leavePlanUpdateReminder";
    try {
        const email = yield mail_services_1.default.sendLeavePlanUpdateReminder(req.body);
        res.send(email);
    }
    catch (err) {
        (0, error_1.handleError)(new error_1.ErrorHandler(errorText, methodName, err), res);
    }
}));
exports.leavePlanUpdateReminder = leavePlanUpdateReminder;
const managerLeaveApprovalReminder = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const methodName = "/managerLeaveApprovalReminder";
    try {
        const email = yield mail_services_1.default.sendManagerLeaveApprovalReminder(req.body);
        res.send(email);
    }
    catch (err) {
        (0, error_1.handleError)(new error_1.ErrorHandler(errorText, methodName, err), res);
    }
}));
exports.managerLeaveApprovalReminder = managerLeaveApprovalReminder;
