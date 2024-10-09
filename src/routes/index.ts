import express from "express";
import employee from "./employee.route";
import leavePlan from "./leavePlan.route";
import mail from "./mail.route";
const router = express.Router();

const defaultRoutes = [
  {
    path: "/employee",
    route: employee,
  },
  {
    path: "/leavePlan",
    route: leavePlan,
  },
  {
    path: "/mail",
    route: mail,
  },
];

defaultRoutes.forEach((r) => {
  router.use(r.path, r.route);
});

export default router;
