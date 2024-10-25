"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.obj = void 0;
const obj = {
    leaveData: {
        "1": {
            leaves: [
                {
                    employee: "1",
                    aalam_id: "A001",
                    employee_name: "John Doe",
                    from_date: "2024-10-01",
                    to_date: "2024-10-03",
                    leave_type: "Leave",
                },
                {
                    employee: "1",
                    aalam_id: "A001",
                    employee_name: "John Doe",
                    from_date: "2024-10-05",
                    to_date: "2024-10-05",
                    leave_type: "WFH",
                },
            ],
        },
        "2": {
            leaves: [
                {
                    employee: "2",
                    aalam_id: "A002",
                    employee_name: "Jane Smith",
                    from_date: "2024-10-02",
                    to_date: "2024-10-04",
                    leave_type: "First Half Leave",
                },
            ],
        },
    },
    employeeData: [
        {
            employee: "1",
            aalam_id: "A001",
            employee_name: "John Doe",
            department: "Engineering",
        },
        {
            employee: "2",
            aalam_id: "A002",
            employee_name: "Jane Smith",
            department: "HR",
        },
        {
            employee: "3",
            aalam_id: "A003",
            employee_name: "Mark Taylor",
            department: "Marketing",
        },
    ],
    startDate: "2024-10-01",
    endDate: "2024-10-07",
};
exports.obj = obj;
