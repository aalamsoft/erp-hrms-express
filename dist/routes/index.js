"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const employee_route_1 = __importDefault(require("./employee.route"));
const leavePlan_route_1 = __importDefault(require("./leavePlan.route"));
const mail_route_1 = __importDefault(require("./mail.route"));
const router = express_1.default.Router();
const defaultRoutes = [
    {
        path: "/employee",
        route: employee_route_1.default,
    },
    {
        path: "/leavePlan",
        route: leavePlan_route_1.default,
    },
    {
        path: "/mail",
        route: mail_route_1.default,
    },
];
defaultRoutes.forEach((r) => {
    router.use(r.path, r.route);
});
exports.default = router;
