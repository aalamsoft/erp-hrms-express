import { logger } from "./logger";
import { Response } from "express";

class ErrorHandler extends Error {
  statusCode: string;
  message: string;
  errString: string;
  constructor(statusCode: string, message: string, errString: string) {
    super();
    this.statusCode = statusCode;
    this.message = message;
    this.errString = errString;
    logger.error(
      "ERRORS: status code: " +
        statusCode +
        " << DETAILS >>" +
        message +
        " << ERRSTRING >>" +
        errString
    );
  }
}

const handleError = (err: ErrorHandler, res: Response) => {
  const { statusCode, message, errString } = err;
  res.json({
    result: "error",
    statusCode,
    message,
    errString,
  });
};

export { ErrorHandler, handleError };
