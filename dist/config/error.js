"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleError = exports.ErrorHandler = void 0;
const logger_1 = require("./logger");
class ErrorHandler extends Error {
    constructor(statusCode, message, errString) {
        super();
        this.statusCode = statusCode;
        this.message = message;
        this.errString = errString;
        logger_1.logger.error("ERRORS: status code: " +
            statusCode +
            " << DETAILS >>" +
            message +
            " << ERRSTRING >>" +
            errString);
    }
}
exports.ErrorHandler = ErrorHandler;
const handleError = (err, res) => {
    const { statusCode, message, errString } = err;
    res.json({
        result: "error",
        statusCode,
        message,
        errString,
    });
};
exports.handleError = handleError;
