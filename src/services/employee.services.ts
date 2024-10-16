const axios = require("axios");

// Fetch employees from Frappe
const employeeList = async () => {
  const url = `${process.env.FRAPPE_URL}/api/resource/Employee`;
  const headers = {
    Authorization: `token ${process.env.FRAPPE_API_KEY}:${process.env.FRAPPE_API_SECRET}`,
    "Content-Type": "application/json",
  };
  const params = {
    fields: JSON.stringify([
      "employee",
      "status",
      "aalam_id", // Accessing aalam_id from the Employee Doctype
      "employee_name",
      "date_of_joining",
      "department",
    ]), // Specify the fields to fetch from Attendance
    filters: JSON.stringify([
      ["status", "in", ["Active"]],
      [
        "department",
        "in",
        [
          "Accounts - AISL",
          "Human Resources - AISL",
          "Development Team - AISL",
          "IT - AISL",
        ],
      ],
      ["aalam_id", "is", "set"],
    ]),
    order_by: "date_of_joining asc ,aalam_id asc ",
    limit_page_length: 0, // Fetch all records (you can set a limit if needed)
  };

  try {
    const response = await axios.get(url, { headers, params });
    return {
      status: true,
      message: "Employee list is collected successfully",
      data: response.data,
    }; // Return the employee data
  } catch (error: any) {
    // Handle errors here
    console.error("Error fetching employee data:", error.message);

    // You can throw the error or return a custom error object
    throw new Error(`Failed to fetch employee data: ${error.message}`);
  }
};

export { employeeList };
