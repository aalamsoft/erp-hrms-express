import winston from "winston";

const tsFormat = () => new Date().toLocaleTimeString();

const enumerateErrorFormat = winston.format((info) => {
  if (info instanceof Error) {
    Object.assign(info, { message: info.stack });
  }
  return info;
});

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({ format: tsFormat }),
        winston.format.colorize(),
        winston.format.simple()
      ),
      level: "debug",
    }),

    new (require("winston-daily-rotate-file"))({
      filename: `logs/statex-api.log`,
      format: winston.format.combine(
        winston.format.timestamp({ format: tsFormat }),
        enumerateErrorFormat(),
        winston.format.colorize(),
        winston.format.splat(),
        winston.format.simple()
      ),
      datePattern: "DD-MMM-YYYY",
      prepend: true,
      level: "debug",
    }),
  ],
});

export { logger };
