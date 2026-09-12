---
name: mern-standards
description: Enforces MERN (MongoDB, Express, React, Node.js) development standards, TypeScript typing, code structure, and API patterns for BMC CivicConnect.
---

# MERN Stack Engineering Standards

## 1. Node.js & Express.js Backend Standards

### 1.1 Architecture & Separation of Concerns
- **Controller Layer (`src/controllers/`)**:
  - Request unwrapping and parameter extraction only.
  - Delegation to Service layer.
  - Response formatting with standardized schema:
    ```typescript
    interface ApiResponse<T> {
      success: boolean;
      message?: string;
      data?: T;
      meta?: {
        total?: number;
        page?: number;
        limit?: number;
      };
    }
    ```
- **Service Layer (`src/services/`)**:
  - Pure business logic, state machine validations, geospatial queries, and event dispatches.
  - Throws typed `AppError` exceptions (e.g. `BadRequestError`, `NotFoundError`, `UnauthorizedError`, `ForbiddenError`).
- **Middleware Layer (`src/middlewares/`)**:
  - `authMiddleware.ts`: Decodes JWT, extracts user, attaches `req.user`.
  - `rbacMiddleware.ts`: Verifies user roles (`authorize(['BMC_ADMIN', 'DEPT_OFFICER'])`).
  - `validateRequest.ts`: Zod schema validation for `body`, `query`, and `params`.
  - `errorHandler.ts`: Global uncaught error handler with clean JSON response.

### 1.2 TypeScript Strictness
- `noImplicitAny: true`
- `strictNullChecks: true`
- Avoid type casting `as any`. Use proper interfaces, generics, or type narrowing.

---

## 2. React 18+ Frontend Standards

### 2.1 State Management Patterns
- **Server State**: Always use TanStack Query (`@tanstack/react-query`) for all asynchronous data fetching, caching, and mutations.
  - Use query keys in structured arrays: `['complaints', { status, wardId }]`, `['ticket', ticketId]`.
  - Invalidate relevant queries after mutations: `queryClient.invalidateQueries({ queryKey: ['complaints'] })`.
- **Client State**: Use **Zustand** for auth state, theme preferences, and global active filters.

### 2.2 Reusable Component Guidelines
- Follow Atomic / Modular component structure.
- Every component must declare explicit TypeScript `Props` interface.
- Accessibility (a11y): Ensure interactive elements have `aria-label`, keyboard navigable, and proper focus styles.

### 2.3 Form Handling
- Use `react-hook-form` paired with `zod` and `@hookform/resolvers/zod`.
- Show inline error messages below form fields with clear red text.
- Disable submit buttons and show loading spinners while mutation is in flight.
