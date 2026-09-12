---
name: workflow-and-state-machine
description: Enforces the civic complaint lifecycle, state machine transitions, SLA calculation, and escalation rules.
---

# Workflow & State Machine Rules

## 1. Complaint State Machine Rules

Every complaint status change MUST strictly adhere to the defined transition matrix:

```
[SUBMITTED] ──(Admin/Auto Assign)──> [ASSIGNED]
     │                                    │
     └──(Admin Reject)──> [REJECTED]       └──(Staff Start)──> [IN_PROGRESS]
                                                                     │
                                                           (Staff Submit Proof)
                                                                     │
                                                                     ▼
                                                         [AWAITING_VERIFICATION]
                                                                │       │
                                    (Citizen Confirms: YES) ────┘       └─── (Citizen Confirms: NO)
                                                │                                       │
                                                ▼                                       ▼
                                             [CLOSED]                              [REOPENED]
                                                                                        │
                                                                                        └───> [ASSIGNED]
```

### 1.1 Backend Guardrails
1. **Evidence Guardrail**: Transition from `IN_PROGRESS` to `AWAITING_VERIFICATION` or `RESOLVED` MUST reject with `400 Bad Request` if `beforePhotoUrl` or `afterPhotoUrl` is missing.
2. **Reassignment Guardrail**: Reassigning a ticket preserves the original creation time and SLA deadline unless an explicit SLA extension is approved by a Super Admin.
3. **Citizen Verification Guardrail**: Only the citizen who created the ticket (or BMC Super Admin) can trigger `AWAITING_VERIFICATION` $\rightarrow$ `CLOSED` or `REOPENED`.

---

## 2. SLA & Escalation Ladder Logic

```
Ticket Created
     ↓
SLA Clock Starts (e.g., 24h for High)
     ↓
SLA Target Reached (0h remaining)
     ↓
[Level 1 Escalation]: Alert Supervisor + Field Staff Flag
     ↓ (After +2h)
[Level 2 Escalation]: Alert Department Head
     ↓ (After +6h)
[Level 3 Escalation]: Flag on BMC Central Admin Escalation Dashboard
```
