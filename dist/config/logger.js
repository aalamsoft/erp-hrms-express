"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const tsFormat = () => new Date().toLocaleTimeString();
const enumerateErrorFormat = winston_1.default.format((info) => {
    if (info instanceof Error) {
        Object.assign(info, { message: info.stack });
    }
    return info;
});
const logger = winston_1.default.createLogger({
    transports: [
        new winston_1.default.transports.Console({
            format: winston_1.default.format.combine(winston_1.default.format.timestamp({ format: tsFormat }), winston_1.default.format.colorize(), winston_1.default.format.simple()),
            level: "debug",
        }),
        new (require("winston-daily-rotate-file"))({
            filename: `logs/statex-api.log`,
            format: winston_1.default.format.combine(winston_1.default.format.timestamp({ format: tsFormat }), enumerateErrorFormat(), winston_1.default.format.colorize(), winston_1.default.format.splat(), winston_1.default.format.simple()),
            datePattern: "DD-MMM-YYYY",
            prepend: true,
            level: "debug",
        }),
    ],
});
exports.logger = logger;
