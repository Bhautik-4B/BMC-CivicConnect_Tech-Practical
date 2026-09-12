# BMC CivicConnect — AI Assistant Guidelines & Development Standards

Welcome to the **BMC CivicConnect (Smart Civic Complaint & Service Management Platform)** project repository. This document defines the engineering standards, architectural boundaries, tech stack requirements, and quality benchmarks for all development work.

---

## 1. Project Philosophy & Core Workflow

BMC CivicConnect follows a strict **4-Party Closed-Loop Cycle**:
$$\text{Citizen (Report)} \longrightarrow \text{BMC Admin (Triage/Route)} \longrightarrow \text{Department (Dispatch)} \longrightarrow \text{Field Staff (Resolve with Proof)} \longrightarrow \text{Citizen (Verify \& Close)}$$

### Non-Negotiable Core Tenets
1. **Verifiable Proof of Work**: A ticket CANNOT be marked `RESOLVED` without both a `beforePhotoUrl`, `afterPhotoUrl`, and a descriptive `resolutionNote`.
2. **Citizen Closed-Loop Verification**: A ticket is only `CLOSED` when the Citizen clicks "Yes, Issue Resolved" or after an automated 48-hour auto-close window post-verification prompt.
3. **Audit Trail Immutability**: All status transitions, assignments, reassignments, and escalations MUST be recorded in the `AuditLog` collection with timestamp and actor ID.
4. **Geospatial Precision**: Every complaint MUST store GeoJSON `Point` coordinates (`[longitude, latitude]`) with `2dsphere` index for accurate Ward mapping and 500m duplicate detection.

---

## 2. Technology Stack & Standard Libraries

### Backend Stack
- **Runtime**: Node.js (v20+ LTS) with **TypeScript (Strict Mode)**
- **Web Framework**: Express.js with modular Controller-Service-Repository architecture
- **Database**: MongoDB (v7+) with Mongoose ODM (strict typing, schema validations, index declarations)
- **Validation**: **Zod** for request schema validation (`req.body`, `req.query`, `req.params`)
- **Realtime**: **Socket.io** (with room-based scoping: `user:<id>`, `dept:<id>`, `ticket:<id>`)
- **Authentication**: JWT (Access Token in memory / header + Refresh Token in HttpOnly cookie) with Argon2 / bcrypt password hashing & OTP support
- **Background Jobs / Cron**: BullMQ + Redis or node-cron for SLA monitoring and duplicate scanning
- **File Upload & Storage**: Multer + Cloudinary / AWS S3 with mime-type checking and image compression

### Frontend Stack
- **Framework**: React 18+ with **Vite** or **Next.js (App Router)** in TypeScript
- **Styling**: **TailwindCSS v3/v4** with clean design tokens (CSS variables)
- **UI Components**: **Shadcn/UI** (Radix UI primitives) + Lucide React icons
- **State Management**: **TanStack Query (React Query v5)** for server state + **Zustand** for lightweight client state
- **Maps & GIS**: **Leaflet / React-Leaflet** or Mapbox GL with OpenStreetMap tiles
- **Form Handling**: **React Hook Form** + `@hookform/resolvers/zod`
- **Charts / Analytics**: **Recharts** or Chart.js for Admin & Department KPI dashboards

---

## 3. Directory & Code Structure Standards

```
Tech-Practical/
├── docs/                           # System blueprints & PRDs
│   ├── MASTER_SYSTEM_ARCHITECTURE.md
│   ├── BMC Admin Panel — MVP.md
│   ├── Citizen Panel — MVP.md
│   ├── Department Panel — MVP.md
│   ├── Field Staff Panel — MVP.md
│   └── Smart Civic Complaint & Service Management Platform.md
├── server/                         # Express.js Backend API
│   ├── src/
│   │   ├── config/                 # DB, Redis, Cloudinary configs
│   │   ├── constants/              # Enums (Roles, Statuses, Priorities)
│   │   ├── controllers/            # Request handlers (lean, calls services)
│   │   ├── middlewares/            # Auth, RBAC, Zod validator, ErrorHandler
│   │   ├── models/                 # Mongoose models & interfaces
│   │   ├── repositories/           # DB query abstractions (optional/service-layer)
│   │   ├── routes/                 # Express router declarations
│   │   ├── services/               # Business logic & state machine transitions
│   │   ├── sockets/                # Socket.io event emitters & handlers
│   │   ├── types/                  # Shared TypeScript types
│   │   ├── utils/                  # Helpers (geo-helpers, logger, token-helpers)
│   │   ├── validations/            # Zod validation schemas
│   │   ├── app.ts                  # Express app setup
│   │   └── server.ts               # Server startup & DB connection
│   ├── package.json
│   └── tsconfig.json
├── client/                         # React / Vite Frontend
│   ├── src/
│   │   ├── assets/                 # Icons, images, logos
│   │   ├── components/             # Reusable UI components
│   │   │   ├── common/             # Button, Input, Modal, Badge, Dropdown
│   │   │   ├── layout/             # Sidebar, Navbar, MobileTabBar
│   │   │   ├── maps/               # Leaflet Map components, GPS Pin Drop
│   │   │   └── ticket/             # TicketCard, Timeline, ProofViewer
│   │   ├── hooks/                  # Custom hooks (useAuth, useSocket, useGeo)
│   │   ├── layouts/                # CitizenLayout, AdminLayout, DeptLayout, FieldLayout
│   │   ├── pages/                  # Role-based page views
│   │   │   ├── citizen/            # Citizen Dashboard, Report, Track, Verify
│   │   │   ├── admin/              # Admin Dashboard, GIS Map, Master Data, SLA
│   │   │   ├── department/         # Dept Queue, Dispatch, Employee workload
│   │   │   ├── field/              # Mobile Task Queue, Start Work, Evidence Upload
│   │   │   └── auth/               # Login, OTP Verification, Register
│   │   ├── services/               # Axios API client instances & endpoints
│   │   ├── store/                  # Zustand global stores (authStore, filterStore)
│   │   ├── types/                  # Frontend TypeScript interfaces
│   │   ├── utils/                  # Date formatters, SLA timers, status color maps
│   │   ├── App.tsx                 # Role-based routing configuration
│   │   └── main.tsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── .agents/                        # Agentic workflow rules
│   └── rules/
├── GEMINI.md                       # Project rules & guidelines
├── AGENTS.md                       # Agent orchestration rules
└── README.md                       # Main project documentation & setup guide
```

---

## 4. Coding & Implementation Rules

### 4.1 Backend Rules
- **No Direct Database Mutation from Controllers**: All business logic and validation must reside in `services/`. Controllers only parse requests and return formatted HTTP responses (`{ success: true, data: ..., message: ... }`).
- **Strict Error Handling**: Use custom `AppError` classes with status codes. Never leave an unhandled promise rejection.
- **Atomic Operations**: When updating complaint status, creating audit logs, and dispatching notifications, use MongoDB Sessions/Transactions (`mongoose.startSession()`) where data consistency is critical.
- **Input Sanitization**: Always strip dangerous HTML/script tags from user-entered complaint descriptions.

### 4.2 Frontend Rules
- **Mobile-First for Field Staff**: Field staff views MUST be fully optimized for mobile devices (360px–430px viewport width) with large touch targets ($\ge 44\text{px}$), quick photo snap buttons, and clear GPS status.
- **Component Modularity**: Break pages down into reusable sub-components. Files should not exceed 300 lines of code.
- **Type Safety**: No `any` types. Share API request/response types or validate with Zod/TypeScript types.
- **Optimistic UI / Fast Feedback**: Provide immediate feedback (spinners, skeleton loaders, toast alerts) on state actions like "Assign Staff" or "Submit Resolution".

---

## 5. Security & RBAC Guidelines

- Every protected API route MUST use `authenticate` and `authorize(Role1, Role2)` middlewares.
- **Department Isolation**: When a Department Officer queries complaints, the query MUST strictly include `{ assignedDepartmentId: req.user.departmentId }`.
- **Field Staff Isolation**: When Field Staff queries tasks, the query MUST strictly include `{ assignedFieldStaffId: req.user._id }`.
- **Masking Sensitive Data**: Citizen mobile numbers and email addresses must be masked for non-Admin roles.
