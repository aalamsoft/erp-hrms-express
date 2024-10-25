import express, { Request, Response } from "express";
import { employeeList } from "../controller/employee.controller";
const router = express.Router();

router.get("/getAll", employeeList);

export default router;
