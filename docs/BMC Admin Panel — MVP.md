# BMC Admin Panel — MVP

### Goal

The BMC Admin Panel is the central management system where BMC administrators can monitor all citizen complaints, assign them to departments, manage users, monitor SLA, track resolutions, and view city-level performance.

***

# 1. Admin Login

### Login

* Email / Mobile
* Password / OTP
* Secure Login

After login:

**BMC Admin Dashboard**

Admin has access to all departments, wards, complaints, and employees.

***

# 2. Admin Dashboard

The dashboard gives a quick overview of the entire city.

### Main KPIs

* **Total Complaints**
* **New Today**
* **In Progress**
* **Resolved**
* **Overdue**
* **Reopened**

Example:

```
Total       12,842
New Today      248
In Progress  1,284
Resolved    10,492
Overdue        318
Reopened        74

```

***

# 3. Complaint Overview

Show a simple chart for:

### Complaints by Status

* New
* Assigned
* In Progress
* Resolved
* Closed
* Reopened

### Complaints by Category

* Road
* Garbage
* Water
* Street Light
* Drainage
* Other

***

# 4. Recent Complaints

Display the latest complaints.

| Ticket   | Issue        | Ward | Department | Priority | Status      |
| -------- | ------------ | ---- | ---------- | -------- | ----------- |
| BMC-1245 | Pothole      | W5   | Road       | High     | In Progress |
| BMC-1244 | Garbage      | W2   | Sanitation | Normal   | New         |
| BMC-1243 | Street Light | W3   | Electrical | High     | Resolved    |

Actions:

**View**

**Assign**

***

# 5. All Complaints

Central complaint management page.

### Filters

* Ticket ID
* Category
* Department
* Ward
* Priority
* Status
* Date
* SLA

### Actions

* View Complaint
* Assign Department
* Change Priority
* Reassign
* Escalate

***

# 6. Complaint Details

Admin can see the complete ticket.

### Complaint Information

* Ticket ID
* Citizen
* Category
* Description
* Photos / Videos
* Location
* Ward
* Created Date
* Priority

### Current Assignment

**Department:** Road Department

**Officer:** Rahul

**Field Staff:** Amit

### Status

**In Progress**

***

# 7. Smart Assignment

Admin can manually assign or use system recommendations.

Example:

### Smart Recommendation

**Category:** Pothole

**Ward:** 5

**Recommended Department:** Road Department

**Priority:** High

**SLA:** 24 Hours

Buttons:

**Accept Recommendation**

**Change Department**

This makes the system feel intelligent while remaining easy to implement.

***

# 8. Department Management

Admin can manage BMC departments.

### Departments

* Road & Infrastructure
* Sanitation
* Water Supply
* Drainage
* Electrical / Street Light
* Parks & Gardens
* Public Health
* Animal Control
* Other

For each department show:

* Department Head
* Employees
* Active Complaints
* Resolved Complaints
* Performance

***

# 9. Employee Management

Admin can manage:

### Officers

### Supervisors

### Field Staff

Employee information:

* Name
* Department
* Role
* Active Tasks
* Completed Tasks
* Status

Admin can:

**Add Employee**

**Edit**

**Deactivate**

***

# 10. Ward & Zone Management

Manage the city structure.

### Zone

↓

### Ward

↓

### Area

Each ward can have:

* Ward Number
* Ward Name
* Zone
* Assigned Department
* Responsible Officer

This also supports automatic complaint routing based on location.

***

# 11. Live Complaint Map

Show complaints geographically.

### Map Filters

* All
* New
* In Progress
* Resolved
* Overdue
* Emergency

Admin can click a complaint marker and open its ticket.

This helps identify areas where many complaints are being reported.

***

# 12. SLA & Escalation

Admin can monitor complaints that are approaching or exceeding their resolution target.

### SLA Status

**On Time**

**Warning**

**Overdue**

Example:

> BMC-1245

> Road Damage

> SLA: 2 Hours Remaining

or:

> ⚠ BMC-1238

> SLA Breached by 8 Hours

***

# 13. Escalation Center

Show complaints requiring attention.

### Sections

* SLA Breached
* High Priority
* Emergency
* Reopened
* No Employee Assigned

Admin can:

* Reassign
* Escalate
* Contact Department
* Change Priority

***

# 14. Citizen Management

Admin can view citizen accounts.

Information:

* Name
* Mobile
* Total Complaints
* Active Complaints
* Resolved Complaints
* Registration Date

Admin should not expose unnecessary citizen information to normal department users.

***

# 15. Notifications

Admin can see system notifications.

Examples:

* New high-priority complaint
* SLA breach
* Department has not accepted complaint
* Citizen reopened complaint
* Resolution submitted
* System alerts

Admin can also send announcements to citizens.

***

# 16. Announcements

Admin can create public announcements.

Example:

### Water Supply Maintenance

**Affected Area:** Ward 4, Ward 5

**Date:** 15 September

**Time:** 10 AM – 4 PM

Button:

**Publish Announcement**

Citizens see the announcement on their Home Dashboard.

***

# 17. Reports & Analytics

Basic city-level analytics.

### Track

* Complaints by Ward
* Complaints by Department
* Complaints by Category
* Resolution Rate
* Average Resolution Time
* SLA Compliance
* Reopened Complaints

Example:

```
Road Department      92%
Sanitation           87%
Water                84%
Street Light         94%
Drainage             79%

```

***

# 18. Feedback & Citizen Satisfaction

Admin can monitor citizen feedback.

### KPIs

**Average Rating:** 4.4 / 5

**Satisfied:** 87%

**Reopened after Resolution:** 6%

Admin can see feedback linked to completed complaints.

***

# 19. Audit Log

Track important administrative actions.

Example:

```
10:20 — Complaint Created
10:23 — Ward Detected
10:25 — Assigned to Road Department
10:40 — Employee Assigned
11:15 — Work Started
13:10 — Resolution Submitted
13:30 — Approved

```

This provides accountability and prevents silent changes to ticket history.

***

# Admin Sidebar

```
Dashboard

Complaints
 ├── All Complaints
 ├── New
 ├── In Progress
 ├── Resolved
 ├── Overdue
 ├── Reopened
 └── Escalated

Live Map

Departments

Employees

Zones & Wards

Assignments

SLA & Escalations

Citizens

Announcements

Notifications

Analytics & Reports

Feedback

Audit Logs

Settings

```

***

# Admin Complaint Lifecycle

```
Citizen Creates Complaint
          ↓
Admin Receives Ticket
          ↓
System Suggests Ward + Department
          ↓
Admin Reviews
          ↓
Department Assigned
          ↓
Department Assigns Field Staff
          ↓
Work Started
          ↓
Resolution Submitted
          ↓
Admin / Supervisor Review
          ↓
Citizen Verification
          ↓
Ticket Closed

```

***

# MVP Screens

For the 2-hour prototype, build these **12 screens**:

1. Admin Login
2. Dashboard
3. All Complaints
4. Complaint Details
5. Smart Assignment
6. Departments
7. Employees
8. Ward & Zone Management
9. Live Complaint Map
10. SLA / Escalations
11. Analytics
12. Notifications / Announcements

### Highest Priority

If development time becomes limited:

**Dashboard → Complaints → Complaint Detail → Assignment → SLA → Live Map**

These screens will make the Admin Panel feel like the central command center of the entire BMC platform.
