---
name: ui-ux-design-rules
description: Defines UI/UX standards, design system tokens, color palettes, responsive rules, and role-specific UI considerations for BMC CivicConnect.
---

# UI/UX & Design System Standards

## 1. Color Palette & Status Semantics

Use clear, accessible, civic-themed color tokens:

### 1.1 Brand & Neutral Colors
- **Primary / Civic Blue**: `#1E40AF` (`blue-800`) / `#2563EB` (`blue-600`) — Reliability, Civic authority.
- **Secondary / Slate**: `#0F172A` (`slate-900`) / `#334155` (`slate-700`) — Typography, headers, sidebars.
- **Background**: `#F8FAFC` (`slate-50`) / `#FFFFFF` (`white`) — Clean card-based surfaces.

### 1.2 Status Color Coding Matrix
| Status | Badge Background | Badge Text | Border Color | Meaning |
| :--- | :--- | :--- | :--- | :--- |
| **`SUBMITTED`** | `#EFF6FF` (`blue-50`) | `#1D4ED8` (`blue-700`) | `#BFDBFE` (`blue-200`) | Logged by citizen |
| **`UNDER_REVIEW`** | `#FAF5FF` (`purple-50`)| `#6B21A8` (`purple-800`)| `#E9D5FF` (`purple-200`)| Under Admin triage |
| **`ASSIGNED`** | `#FEF3C7` (`amber-50`) | `#B45309` (`amber-700`)| `#FDE68A` (`amber-200`)| Transferred to Dept |
| **`IN_PROGRESS`** | `#E0F2FE` (`sky-50`) | `#0369A1` (`sky-700`) | `#BAE6FD` (`sky-200`) | Ground work underway |
| **`AWAITING_VERIFICATION`** | `#FEF9C3` (`yellow-50`)| `#A16207` (`yellow-700`)| `#FEF08A` (`yellow-200`)| Citizen sign-off pending |
| **`RESOLVED` / `CLOSED`** | `#F0FDF4` (`green-50`)| `#15803D` (`green-700`)| `#BBF7D0` (`green-200`)| Fully resolved |
| **`REOPENED`** | `#FFF1F2` (`rose-50`) | `#BE123C` (`rose-700`) | `#FECDD3` (`rose-200`)| Citizen contested resolution |
| **`REJECTED`** | `#F3F4F6` (`gray-100`) | `#374151` (`gray-700`) | `#E5E7EB` (`gray-200`)| Invalid/Spam |

---

## 2. Priority & SLA Visual Indicators

- 🔴 **Emergency**: Pulsing red badge (`bg-red-500 text-white animate-pulse`). SLA $\le 4\text{h}$.
- 🟠 **High Priority**: Amber/Orange badge (`bg-orange-100 text-orange-800 border-orange-300`). SLA $\le 24\text{h}$.
- 🟢 **Normal Priority**: Slate/Blue badge (`bg-slate-100 text-slate-700`). SLA $\le 72\text{h}$.
- ⚠️ **SLA Warning Badge**: Shows countdown timer (e.g. `2h 15m remaining` in amber or `Breached by 4h` in bold red).

---

## 3. Role-Specific UX Paradigms

### 3.1 Citizen Panel (Mobile & Web)
- Simple step-by-step reporting wizard:
  1. *Category Picker* (large touchable cards with icons).
  2. *Photo Capture & Notes* (camera trigger / gallery upload).
  3. *Location Pinning* (auto-geolocation + interactive map pin drag).
  4. *Smart Review & Confirmation*.
- Prominent verification card on resolved tickets:
  - Clear split screen of **"Before" vs "After"** photos.
  - Large green button: **"Yes, Issue Resolved"**.
  - Secondary red outlined button: **"No, Issue Still Exists"** (opens simple reason drawer).

### 3.2 BMC Admin Command Center (Desktop Web)
- High-density data views with collapsible sidebar.
- Interactive **GIS Map** supporting clustering, Ward boundary overlays, and quick-filter chips.
- Quick modal drawer for fast department assignment without losing context in tables.

### 3.3 Field Staff Mobile Interface (Mobile-First PWA)
- Large touch targets ($\ge 48\text{px}$).
- One-click navigation trigger (`geo:${lat},${lng}` or Google Maps URL).
- Explicit 3-stage action button:
  1. `[ Start Work ]` $\rightarrow$ timestamps work start.
  2. `[ Take Before Photo ]` $\rightarrow$ uploads proof.
  3. `[ Complete & Submit Proof ]` $\rightarrow$ prompts after photo & brief note.
