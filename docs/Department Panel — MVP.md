# Department Panel — MVP

### Goal

The Department Panel allows each BMC department to manage complaints assigned to them, assign work to employees, monitor SLA/status, and submit completed work for verification.

***

# 1. Department Login

Department users log in using:

* Mobile / Email
* Password / OTP
* Role-based access

After login, the user sees only the data related to their department.

Example:

**Road & Infrastructure Department**

***

# 2. Department Dashboard

### KPI Cards

* **New Complaints** — 24
* **In Progress** — 18
* **Resolved** — 42
* **Overdue** — 5

### Priority Summary

* Emergency
* High
* Normal

### Today's Work

Show:

* New assignments
* Pending assignments
* Work in progress
* Completed today

***

# 3. Complaint Queue

List all complaints assigned to the department.

| Ticket   | Issue       | Ward | Priority | Assigned To | Status      |
| -------- | ----------- | ---- | -------- | ----------- | ----------- |
| BMC-1245 | Pothole     | W5   | High     | Amit        | In Progress |
| BMC-1246 | Road Damage | W3   | Normal   | Raj         | Pending     |
| BMC-1247 | Footpath    | W2   | High     | —           | New         |

### Filters

* Status
* Ward
* Priority
* Date
* Assigned Employee

***

# 4. Complaint Details

When department opens a ticket:

### Complaint

* Ticket ID
* Category
* Description
* Citizen Photo/Video
* Location
* Ward
* Created Date
* Priority

### Assignment

**Department:** Road & Infrastructure

**Supervisor:** Rahul

**Field Staff:** Not Assigned

### SLA

**Resolution Target:** 24 Hours

**Remaining:** 08 Hours

***

# 5. Assign Employee

Department can assign the complaint to a field employee.

### Select Field Staff

Show:

* Employee Name
* Current Tasks
* Availability
* Department

Example:

**Amit Patel**

7 Active Tasks

● Available

**Raj Shah**

11 Active Tasks

● Busy

Button:

### Assign Complaint

After assignment:

**Status → Assigned**

Employee receives notification.

***

# 6. Work Status Management

Department can monitor/change the ticket status:

**New**

↓

**Assigned**

↓

**In Progress**

↓

**Resolved**

↓

**Awaiting Verification**

The department should not be able to arbitrarily skip important workflow steps unless the user has appropriate permission.

***

# 7. Field Work Monitoring

For every assigned ticket, department can see:

### Field Staff

Amit Patel

### Work Started

10:45 AM

### Current Status

**In Progress**

### Location

Map / Service Area

### Evidence

Before photo

After photo

This lets the department know whether the assigned employee is actually progressing.

***

# 8. Resolution Submission

After field staff completes the work, department can review:

### Resolution

**Before Photo**

\[Image]

**After Photo**

\[Image]

**Work Description**

> Pothole repaired and road surface restored.

Department can:

**Approve Resolution**

or

**Send Back for Correction**

After approval:

**Status → Awaiting Citizen Verification**

***

# 9. Overdue & Escalations

Create a small dedicated section.

### Overdue Complaints

Show tickets where SLA has expired.

Example:

**BMC-1241**

Road Damage

Ward 4

**SLA Breached by 6 Hours**

Actions:

* View
* Reassign
* Escalate

### Escalation

If no action is taken:

**Field Staff → Supervisor → Department Head → BMC Admin**

***

# 10. Department Employees

Simple employee management.

### Employee List

Show:

* Name
* Role
* Active Tasks
* Completed Tasks
* Availability

Example:

**Amit Patel**

Field Staff

7 Active | 128 Completed

● Available

**Raj Shah**

Field Staff

11 Active | 96 Completed

● Busy

***

# 11. Department Performance

Basic analytics:

### This Month

* Total Complaints
* Resolved
* Pending
* Overdue
* Average Resolution Time
* SLA Compliance

Example:

**Resolution Rate:** 89%

**SLA Compliance:** 93%

**Average Resolution:** 1.8 Days

***

# 12. Notifications

Department receives:

* New complaint assigned
* New employee assignment
* High-priority complaint
* SLA warning
* SLA breach
* Work completed
* Citizen reopened complaint
* Admin message

Example:

> **BMC-1245:** Citizen has reopened the complaint. Immediate action required.

***

# Department Sidebar

```
Dashboard

Complaints
 ├── All
 ├── New
 ├── Assigned
 ├── In Progress
 ├── Resolved
 ├── Overdue
 └── Reopened

Employees

Assignments

Escalations

Performance

Notifications

Profile

```

***

# Department Complaint Flow

```
BMC Admin
    ↓
Complaint Assigned
    ↓
Department Receives
    ↓
Review Complaint
    ↓
Assign Field Staff
    ↓
Field Staff Starts Work
    ↓
Work Completed
    ↓
Before / After Evidence
    ↓
Department Reviews
    ↓
Awaiting Citizen Verification
    ↓
Citizen Confirms
    ↓
Ticket Closed

```

***

# MVP Screens

For the 2-hour prototype, build these **10 screens**:

1. Department Login
2. Dashboard
3. Complaint List
4. Complaint Details
5. Assign Employee
6. Employee List
7. Work Monitoring
8. Resolution Review
9. Overdue / Escalations
10. Department Performance

### Highest Priority

If time becomes short:

**Dashboard → Complaint List → Complaint Details → Assign Employee → Work Status → Resolution**

These screens are enough to demonstrate the complete **Admin → Department → Field Staff** workflow.

