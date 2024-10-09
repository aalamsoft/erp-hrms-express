require("dotenv").config();
import express from "express";
import morgan from "morgan";
import bodyParser from "body-parser";
import routes from "./routes";
import cors from "cors";
import { createServer } from "http";
import * as leavePlanService from "../src/services/leavePlan.service";
const nodeCron = require("node-cron");
const host = process.env.API_HOST ?? "localhost";
const port = process.env.API_PORT ? Number(process.env.API_PORT) : 3000;
const statexFrontEndURL = process.env.NEXT_APP_URL;
let LEAVEPLANREPORT_CRON_JOB = process.env.LEAVEPLANREPORT_CRON_JOB;

const app = express();

app.use(morgan("dev"));
app.use(express.static("public"));

/* Parse JSON bodies */
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: false }));

const corsOptions = {
  origin: [`http://${host}:${port}`],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept,Authorization"
  );
  next();
});

app.use(cors(corsOptions));
app.use("/api", routes);

/* Socket Configuration */

const httpServer = createServer(app);

nodeCron.schedule(`${LEAVEPLANREPORT_CRON_JOB}`, async function () {
  try {
    if (process.env.LEAVEPLAN_SCHEDULER === "2") {
      const object = {
        startDate: "2024-10-01",
        endDate: "2024-10-31",
      };
      const generateLeaveReport = await leavePlanService.getLeaveReport(object);
    }
  } catch (error) {
    console.log("err in LEAVEPLANREPORT_CRON_JOB mail", error);
  }
});
httpServer.listen(port, host, () => {
  console.log(`ERP hrms API App Listening on Port http://${host}:${port}`);
});
