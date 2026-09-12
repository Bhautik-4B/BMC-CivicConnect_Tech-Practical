# Citizen Panel — MVP

### Goal

Allow citizens to quickly report BMC-related issues, track their ticket, receive updates, and verify the resolution.

***

## 1. Login / Registration

### Login

* Mobile Number
* OTP
* Login

### Registration

* Name
* Mobile Number
* Email (optional)
* OTP Verification

***

# 2. Home Dashboard

### Header

* Citizen Name
* Current Area/Location
* Notification icon

### Main CTA

**+ Report a Civic Issue**

### Quick Categories

* Road & Pothole
* Garbage
* Water
* Street Light
* Drainage
* Other

### My Complaint Summary

* Active
* In Progress
* Resolved

### Recent Complaints

Show the latest 2–3 tickets.

***

# 3. Report Issue

Simple step-based form.

### Category

Select:

* Road
* Garbage
* Water
* Street Light
* Drainage
* Other

### Description

Text box to explain the issue.

### Evidence

* Take Photo
* Upload Photo
* Optional Video

### Location

* Use Current Location
* Select Location on Map

***

# 4. Smart Information

After selecting the location/category, show automatic suggestions:

**Detected Ward:** Ward 5

**Suggested Department:** Road Department

**Suggested Priority:** High

Citizen can confirm or change the category if required.

***

# 5. Review & Submit

Show:

* Category
* Description
* Photo
* Location
* Ward
* Department
* Priority

Button:

### Submit Complaint

***

# 6. Complaint Success

After submission:

### Complaint Registered Successfully

**Ticket ID: BMC-2026-001245**

**Status: Submitted**

Buttons:

* Track Complaint
* Back to Home

***

# 7. My Complaints

Tabs:

### Active

Tickets currently being processed.

### Resolved

Completed tickets.

Each ticket card:

**BMC-2026-001245**

Pothole — Ward 5

**In Progress**

**BMC-2026-001198**

Street Light — Ward 3

**Resolved**

Search by Ticket ID can be added.

***

# 8. Ticket Details & Tracking

This is the most important citizen screen.

### Ticket Information

* Ticket ID
* Category
* Description
* Location
* Ward
* Department
* Priority
* Created Date

### Current Status

**IN PROGRESS**

### Timeline

✓ Complaint Submitted

✓ Under Review

✓ Assigned to Department

● Work In Progress

○ Resolved

○ Closed

### Latest Update

> Field staff has started working on your complaint.

***

# 9. Resolution & Verification

When BMC resolves the ticket:

### Issue Resolution

**Before**

\[Photo]

**After**

\[Photo]

**Resolution Note**

> Road repair completed.

### Citizen Verification

**Is your issue resolved?**

\[ Yes, Issue Resolved ]

\[ No, Issue Still Exists ]

***

# 10. Reopen Complaint

If the citizen selects **No**:

* Reason
* Optional Photo
* Comment

Button:

### Reopen Complaint

Status changes:

**Resolved → Reopened**

BMC receives a notification.

***

# 11. Notifications

Show important updates:

* Complaint submitted
* Complaint assigned
* Work started
* Complaint resolved
* Verification required
* Complaint reopened
* BMC announcements

Example:

> **BMC-2026-001245** has been assigned to the Road Department.

***

# 12. Profile & Settings

### Profile

* Name
* Mobile
* Email
* Location

### Settings

* Language: English / Gujarati / Hindi
* Notifications
* Help & Support
* Terms & Privacy
* Logout
* Delete Account

***

# Citizen Complaint Flow

```
Report Issue
      ↓
Select Category
      ↓
Add Description + Photo
      ↓
Select Location
      ↓
Ward + Department Detected
      ↓
Submit
      ↓
Ticket Created
      ↓
Track Status
      ↓
BMC Resolves
      ↓
Before / After Evidence
      ↓
Citizen Verification
      ↓
Closed

```

***

# MVP Screen List

For the 2-hour prototype, build these **12 screens**:

1. Login
2. Home
3. Categories
4. Report Issue
5. Location
6. Review & Submit
7. Complaint Success
8. My Complaints
9. Ticket Details / Tracking
10. Resolution Verification
11. Notifications
12. Profile

### Highest Priority

If time becomes short, focus on:

**Home → Report → Submit → Ticket → Tracking → Resolution**



Those screens create the complete citizen experience.

