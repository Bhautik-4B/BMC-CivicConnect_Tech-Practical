# Field Staff Panel — MVP

### Goal

The Field Staff Panel allows BMC workers to receive assigned complaints, navigate to the issue location, start work, upload proof, and submit the work for verification.

***

# 1. Field Staff Login

### Login

* Mobile / Employee ID
* Password / OTP

After login, the employee sees only their assigned work.

***

# 2. Field Staff Dashboard

### Header

**Good Morning, Amit**

**Road Department**

### Work Summary

* **Assigned:** 8
* **In Progress:** 2
* **Completed Today:** 5
* **Overdue:** 1

### Priority

**2 High Priority Tasks**

***

# 3. My Tasks

List all assigned complaints.

Example:

**BMC-1245**

Pothole

Ward 5

🔴 High Priority

**In Progress**

**BMC-1246**

Road Damage

Ward 3

Normal

**Assigned**

Filters:

* All
* Pending
* In Progress
* Completed
* Overdue

***

# 4. Task Details

When the employee opens a task:

### Complaint

**BMC-1245**

**Pothole**

### Description

Large pothole reported near the main road.

### Citizen Evidence

\[Photo]

### Location

**Ward 5, Bhavnagar**

\[View Map]

### SLA

**8 Hours Remaining**

***

# 5. Navigation

Show the complaint location on a map.

Button:

### Navigate to Location

The employee can open the location in the map/navigation application.

Also display:

* Distance
* Area
* Ward

***

# 6. Start Work

Before beginning:

### Start Work

When clicked:

**Status → In Progress**

System records:

* Start time
* Employee
* Ticket ID

Example:

> Work started at 11:15 AM.

***

# 7. Before Work Evidence

Employee can upload:

### Before Photo

* Take Photo
* Upload Photo

Optional:

* Video
* Work Note

This creates proof of the original condition.

***

# 8. Work Update

Employee can add a quick progress update.

Example:

> Road repair work has started.

Status options:

**In Progress**

**Waiting for Material**

**Waiting for Approval**

**Work Completed**

For the MVP, keep the main flow simple.

***

# 9. Complete Work

After finishing:

### Upload After Photo

\[Take Photo]

\[Upload Photo]

### Resolution Note

Example:

> Pothole repaired and road surface restored.

Button:

### Submit Resolution

***

# 10. Resolution Submitted

Show:

### Work Submitted Successfully

**Ticket:** BMC-1245

**Status:** Awaiting Verification

**Submitted:** 1:35 PM

The department/supervisor can now review the work.

***

# 11. Work History

Field staff can see completed tasks.

Example:

**BMC-1230**

Street Repair

✓ Completed

**BMC-1224**

Pothole

✓ Completed

Display:

* Ticket ID
* Issue
* Date
* Resolution status

***

# 12. Notifications

Employee receives:

* New task assigned
* Task reassigned
* High-priority task
* SLA warning
* Task overdue
* Resolution approved
* Resolution rejected
* New instructions

Example:

> **New High Priority Task:** BMC-1245 has been assigned to you.

***

# 13. Profile

Show:

* Employee Name
* Employee ID
* Department
* Role
* Phone
* Work Statistics

Example:

**Completed:** 128

**This Month:** 34

**SLA Compliance:** 94%

***

# Field Staff Sidebar

```
Dashboard

My Tasks
 ├── Assigned
 ├── In Progress
 ├── Completed
 └── Overdue

Map

Work History

Notifications

Profile

```

***

# Field Staff Workflow

```
Task Assigned
      ↓
View Complaint
      ↓
Open Location
      ↓
Navigate
      ↓
Start Work
      ↓
Upload Before Photo
      ↓
Complete Work
      ↓
Upload After Photo
      ↓
Add Resolution Note
      ↓
Submit Resolution
      ↓
Department / Supervisor Review
      ↓
Citizen Verification

```

***

# MVP Screens

Build these **9 screens**:

1. Login
2. Dashboard
3. My Tasks
4. Task Details
5. Map / Navigation
6. Start Work
7. Before / After Evidence
8. Submit Resolution
9. Work History

### Highest Priority

If time is very limited:

**Dashboard → My Tasks → Task Details → Start Work → Before/After → Complete**

This panel should be **mobile-first**, because the field employee will primarily use it while working outside the office.
