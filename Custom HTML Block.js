// Assuming 'root_element' is provided by default
let clock_element = root_element.querySelector('#digitalClock');

function updateClock() {
    const now = new Date();

    // Get hours, minutes, and seconds
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';

    // Convert to 12-hour format
    hours = hours % 12 || 12;

    // Add leading zeros
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;

    // Get day of the week
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const day = days[now.getDay()]; // Get the current day

    // Get date components
    const date = now.getDate(); // Get the day of the month
    const month = now.getMonth() + 1; // Get the month (0-11), add 1 for 1-12
    const year = now.getFullYear(); // Get the full year

    // Format date in dd-mm-yyyy
    const formattedDate = `${date < 10 ? '0' + date : date}-${month < 10 ? '0' + month : month}-${year}`;

    // Format time string with <br> for line breaks
    const timeString = `${hours}:${minutes}:${seconds} ${ampm}<br>${formattedDate}<br>${day}`;

    // Update clock element
    clock_element.innerHTML = timeString; // Use innerHTML to allow <br> tags
}

// Call updateClock immediately and every second thereafter
updateClock();
setInterval(updateClock, 1000);



// Assuming 'root_element' is provided by default
let employee_id_element = root_element.querySelector('#employee_id');
let employee_name_element = root_element.querySelector('#employee_name');
let employee_designation_element = root_element.querySelector('#employee_designation');
let employee_email_element = root_element.querySelector('#employee_email_id');

// Function to fetch employee details by logged-in user ID (only Active employees)
function fetchEmployeeDetails() {
    frappe.call({
        method: 'frappe.client.get_list',
        args: {
            doctype: 'Employee',
            filters: {
                user_id: frappe.session.user,  // Filter by logged-in user's email
                status: 'Active'  // Only fetch active employees
            },
            fields: ['employee_id', 'employee_name', 'designation', 'user_id'],  // Fields to fetch
            limit_page_length: 1  // Get only one result
        },
        callback: function (response) {
            if (response.message && response.message.length > 0) {
                const employee = response.message[0];

                // Update card elements with fetched data
                employee_id_element.textContent = employee.employee_id;
                employee_name_element.textContent = employee.employee_name;
                employee_designation_element.textContent = employee.designation;
                employee_email_element.textContent = employee.user_id;
            } else {
                console.error('Active employee details not found.');
                employee_name_element.textContent = 'Active employee not found';
            }
        },
        error: function (err) {
            console.error('Error fetching employee details:', err);
        }
    });
}

// Fetch employee details when the page loads
fetchEmployeeDetails();






// Selecting the elements to display attendance details
let attendance_day1_element = root_element.querySelector('#attendance_day1');
let attendance_status1_element = root_element.querySelector('#attendance_status1');
let attendance_day2_element = root_element.querySelector('#attendance_day2');
let attendance_status2_element = root_element.querySelector('#attendance_status2');

// Function to format date as dd/mm/yyyy
function formatDate(dateString) {
    let date = new Date(dateString);
    return date.toLocaleDateString('en-GB'); // 'en-GB' ensures dd/mm/yyyy format
}

// Function to fetch attendance details for the logged-in employee using their user ID
function fetchAttendanceDetails() {
    let userId = frappe.session.user;

    if (!userId) {
        console.error('User ID not found.');
        return;
    }

    // Fetch the corresponding employee record using the logged-in user ID
    frappe.call({
        method: 'frappe.client.get_value',
        args: {
            doctype: 'Employee',
            fieldname: 'name',
            filters: { user_id: userId }
        },
        callback: function (response) {
            if (response.message) {
                let employeeId = response.message.name;

                // Check if the employee status is active
                frappe.call({
                    method: 'frappe.client.get_value',
                    args: {
                        doctype: 'Employee',
                        fieldname: 'status',
                        filters: { name: employeeId }
                    },
                    callback: function (statusResponse) {
                        if (statusResponse.message && statusResponse.message.status === 'Active') {
                            // Fetch the attendance records using the employee ID
                            frappe.call({
                                method: 'frappe.client.get_list',
                                args: {
                                    doctype: 'Attendance',
                                    filters: { employee: employeeId },
                                    fields: ['attendance_date', 'status'],
                                    order_by: 'attendance_date desc',
                                    limit_page_length: 2
                                },
                                callback: function (res) {
                                    if (res.message && res.message.length > 0) {
                                        // Display the first attendance record
                                        if (res.message[0]) {
                                            attendance_day1_element.textContent =
                                                formatDate(res.message[0].attendance_date);
                                            attendance_status1_element.textContent = res.message[0].status;
                                        }

                                        // Display the second attendance record if available
                                        if (res.message[1]) {
                                            attendance_day2_element.textContent =
                                                formatDate(res.message[1].attendance_date);
                                            attendance_status2_element.textContent = res.message[1].status;
                                        } else {
                                            attendance_day2_element.textContent = 'N/A';
                                            attendance_status2_element.textContent = 'No Record';
                                        }
                                    } else {
                                        attendance_day1_element.textContent = 'N/A';
                                        attendance_status1_element.textContent = 'No Record';
                                        attendance_day2_element.textContent = 'N/A';
                                        attendance_status2_element.textContent = 'No Record';
                                    }
                                },
                                error: function (err) {
                                    console.error('Error fetching attendance details:', err);
                                }
                            });
                        } else {
                            attendance_day1_element.textContent = 'N/A';
                            attendance_status1_element.textContent = 'No Record';
                            attendance_day2_element.textContent = 'N/A';
                            attendance_status2_element.textContent = 'No Record';
                        }
                    },
                    error: function (err) {
                        console.error('Error fetching employee status:', err);
                    }
                });
            } else {
                console.error('Employee not found.');
            }
        },
        error: function (err) {
            console.error('Error fetching employee ID:', err);
        }
    });
}

// Call the function to load attendance details
fetchAttendanceDetails();



// Selecting elements to display leave balances
let casualLeaveElement = root_element.querySelector('#casual_leave_balance');
let earnedLeaveElement = root_element.querySelector('#earned_leave_balance');

// Function to fetch and display leave balances for the logged-in employee
function fetchLeaveBalances() {
    let userId = frappe.session.user;

    if (!userId) {
        console.error('User ID not found.');
        return;
    }

    console.log(`Fetching leave balances for User ID: ${userId}`);

    // Fetch the corresponding employee record using the logged-in user ID with status check
    frappe.call({
        method: 'frappe.client.get_value',
        args: {
            doctype: 'Employee',
            fieldname: ['name'],
            filters: {
                user_id: userId,
                status: 'Active' // Fetch only active employees directly
            }
        },
        callback: function (response) {
            if (response.message) {
                let employeeId = response.message.name;
                console.log(`Active Employee ID: ${employeeId}`);

                // Fetch leave ledger entries for the active employee
                frappe.call({
                    method: 'frappe.client.get_list',
                    args: {
                        doctype: 'Leave Ledger Entry',
                        filters: {
                            employee: employeeId,
                            leave_type: ['in', ['Casual Leave', 'Earned Leave']],
                            docstatus: 1 // Only approved entries
                        },
                        fields: ['leave_type', 'leaves', 'transaction_type'],
                    },
                    callback: function (res) {
                        console.log('Fetched Leave Ledger Entries:', res.message);

                        if (res.message && res.message.length > 0) {
                            let leaveBalances = { 
                                'Casual Leave': 0, 
                                'Earned Leave': 0 
                            };

                            // Calculate the leave balance
                            res.message.forEach(entry => {
                                let type = entry.leave_type;
                                let days = entry.leaves;
                                console.log(`Processing: ${type}, ${days} days, ${entry.transaction_type}`);

                                if (entry.transaction_type === 'Leave Application') {
                                    leaveBalances[type] -= days; // Deduct used leave
                                } else if (entry.transaction_type === 'Leave Allocation') {
                                    leaveBalances[type] += days; // Add allocated leave
                                }
                            });

                            // Display the calculated balances
                            casualLeaveElement.textContent = 
                                leaveBalances['Casual Leave'] >= 0 
                                    ? leaveBalances['Casual Leave'].toString() 
                                    : '0';
                            earnedLeaveElement.textContent = 
                                leaveBalances['Earned Leave'] >= 0 
                                    ? leaveBalances['Earned Leave'].toString() 
                                    : '0';
                        } else {
                            console.warn(`No leave ledger entries found for ${employeeId}`);
                            casualLeaveElement.textContent = '0';
                            earnedLeaveElement.textContent = '0';
                        }
                    },
                    error: function (err) {
                        console.error('Error fetching leave ledger entries:', err);
                        casualLeaveElement.textContent = 'Error';
                        earnedLeaveElement.textContent = 'Error';
                    }
                });
            } else {
                console.warn('No active employee found for the given user.');
                casualLeaveElement.textContent = 'N/A';
                earnedLeaveElement.textContent = 'N/A';
            }
        },
        error: function (err) {
            console.error('Error fetching employee details:', err);
            casualLeaveElement.textContent = 'Error';
            earnedLeaveElement.textContent = 'Error';
        }
    });
}

// Call the function to load leave balances
fetchLeaveBalances();




let holiday1Element = root_element.querySelector('#holiday1');
let holiday2Element = root_element.querySelector('#holiday2');

if (!holiday1Element || !holiday2Element) {
    console.error('Holiday elements not found.');
    return;
}

function fetchUpcomingHolidays() {
    let userId = frappe.session.user;

    if (!userId) {
        console.error('User ID not found.');
        return;
    }

    console.log(`Fetching upcoming holidays for User ID: ${userId}`);

    // Fetch the employee record using the logged-in user ID
    frappe.call({
    method: 'late_minutes.api.get_upcoming_holidays',
    args: { user_id: frappe.session.user },
    callback: function(response) {
        if (response.message.status === 'success') {
            const holidays = response.message.holidays;
            holiday1Element.textContent = holidays[0] || 'No upcoming holidays.';
            holiday2Element.textContent = holidays[1] || '';
        } else {
            holiday1Element.textContent = 'Error fetching holidays.';
            holiday2Element.textContent = response.message.message;
        }
    },
    error: function(err) {
        console.error('Error fetching holidays:', err);
        holiday1Element.textContent = 'Error fetching holidays.';
        holiday2Element.textContent = '';
    }
});


}

// Call the function to load upcoming holidays
fetchUpcomingHolidays();




