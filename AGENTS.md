# BMC CivicConnect — Agent Orchestration & Workspace Rules

This repository contains the architecture, specifications, and codebase for **BMC CivicConnect (Smart Civic Complaint & Service Management Platform)**.

## Active Rules & References
The following rule files in `.agents/rules/` govern all code generation, refactoring, and database operations:
- [mern-standards.md](file:///Windows%20Use/Bhautik/Tech-Practical/.agents/rules/mern-standards.md): Standards for Express.js, TypeScript, React 18+, and TanStack Query.
- [database-rules.md](file:///Windows%20Use/Bhautik/Tech-Practical/.agents/rules/database-rules.md): MongoDB indexing, geospatial queries (`2dsphere`), and Mongoose transaction patterns.
- [ui-ux-design-rules.md](file:///Windows%20Use/Bhautik/Tech-Practical/.agents/rules/ui-ux-design-rules.md): Design tokens, status color palettes, and responsive layouts.
- [workflow-and-state-machine.md](file:///Windows%20Use/Bhautik/Tech-Practical/.agents/rules/workflow-and-state-machine.md): Complaint lifecycle transitions, evidence validation, and SLA escalation logic.

## Key Architectural Files
- [MASTER_SYSTEM_ARCHITECTURE.md](file:///Windows%20Use/Bhautik/Tech-Practical/docs/MASTER_SYSTEM_ARCHITECTURE.md): Complete system specification, Mongoose schemas, and Socket.io contracts.
- [GEMINI.md](file:///Windows%20Use/Bhautik/Tech-Practical/GEMINI.md): Core assistant guidelines and project standards.

## Behavioral Directives for Agents
1. **Never Bypass State Validation**: Always enforce valid status transitions and check for mandatory evidence before advancing complaint states.
2. **Preserve Geospatial Coordinates**: Always maintain GeoJSON coordinate ordering (`[longitude, latitude]`).
3. **Role-Based Scoping**: Strictly ensure data security where non-admin users only receive data scoped to their permissions and department.
