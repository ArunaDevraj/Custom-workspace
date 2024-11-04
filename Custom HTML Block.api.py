[sudo] password for frappe: 
import frappe
from frappe.utils import getdate, today, formatdate

@frappe.whitelist(allow_guest=True)
def get_upcoming_holidays(user_id):
    try:
        # Step 1: Fetch the employee and associated holiday list
        employee = frappe.get_value(
            "Employee",
            {"user_id": user_id, "status": "Active"},
            ["name", "holiday_list"]
        )

        if not employee:
            return {"status": "error", "message": "Active employee not found."}

        holiday_list_name = employee[1]

        # Step 2: Fetch upcoming holidays from the 'Holiday' doctype using the correct parent relationship
        holidays = frappe.get_all(
            "Holiday",
            filters={
                "parent": holiday_list_name,
                "holiday_date": [">=", today()],
            },
            fields=["holiday_date", "description as holiday_name"],
            order_by="holiday_date asc"
        )

        # Step 3: Filter out holidays falling on weekends (Saturday = 5, Sunday = 6)
        upcoming_holidays = [
            h for h in holidays if getdate(h["holiday_date"]).weekday() not in [5, 6]
        ][:2]  # Limit to 2 holidays

        # Step 4: Format the holidays for display
        formatted_holidays = [
            f"{formatdate(h['holiday_date'], 'dd-MM-yyyy')} - {h['holiday_name']}"
            for h in upcoming_holidays
        ]

        return {"status": "success", "holidays": formatted_holidays}

    except Exception as e:
        frappe.log_error(f"Error fetching holidays: {str(e)}", "Holiday Fetch Error")
        return {"status": "error", "message": f"Error fetching holidays: {str(e)}"}

