# Haven CRM — Production Audit

## Executive summary

Haven CRM is a functional MVP for a hotel CRM, with the expected modules for guest management, booking, complaints, feedback, authentication, and dashboard reporting. The project is organized as a React frontend and an Express/MySQL backend, and the codebase already demonstrates a solid foundation for a student project or internal prototype.

However, it is not yet production-grade. The main issues are:

- architecture is still thin and mixes business logic with HTTP code
- security controls are incomplete and partly rely on default or placeholder values
- database schema is inconsistent with the documented MySQL target and under-specifies production hotel operations
- authorization is limited to a single admin check in the backend and route protection in the frontend
- validation is inconsistent and mostly absent outside a few simple field checks
- the booking engine does not yet cover hotel-grade operational states and edge cases
- there are no real automated tests, migration strategy, deployment or backup documentation, or strong observability

This is a viable base for a production transformation, but it needs phased hardening before it can be treated as a real hotel-management system.

---

## 1) Current architecture summary

### 1.1 High-level architecture

The current architecture is described in the repository as:

React Frontend → Express REST API → MySQL Database

Actual implementation confirms this shape:

- Frontend:
  - `frontend/src/App.js`
  - `frontend/src/context/AuthContext.js`
  - `frontend/src/api.js`
  - `frontend/src/pages/*`
  - `frontend/src/components/*`
- Backend:
  - `backend/src/app.js`
  - `backend/src/server.js`
  - `backend/src/routes/*`
  - `backend/src/controllers/*`
  - `backend/src/middleware/*`
  - `backend/src/config/*`
- Database:
  - `database/schema.sql`

### 1.2 Dependencies in use

Backend dependencies (`backend/package.json`):

- `express` — API server
- `mysql2` — MySQL access
- `jsonwebtoken` — JWT handling
- `bcryptjs` — password hashing
- `cors` — CORS support
- `dotenv` — env loading
- `@supabase/supabase-js` — optional Supabase integration

Frontend dependencies (`frontend/package.json`):

- `react` / `react-dom`
- `react-router-dom`
- `react-scripts`
- `@supabase/supabase-js`

### 1.3 Data flow

- React pages call `frontend/src/api.js` wrapper.
- `api.js` attaches JWT from `sessionStorage` when present.
- Requests are sent to the backend API (default `http://localhost:5000/api`).
- Backend routes delegate to controllers.
- Controllers query MySQL via `backend/src/config/db.js`.
- Results are returned as JSON to the frontend.
- The frontend stores auth state in `AuthContext` and uses route guards for client-side navigation.

### 1.4 Authentication flow

Current flow:

1. User signs in at `/auth/login`.
2. Backend checks user email and password.
3. Password is hashed with bcryptjs and compared.
4. If valid, it signs a JWT using `jsonwebtoken`.
5. Token is returned to frontend and stored in `sessionStorage`.
6. `requireAuth` middleware verifies the token on protected endpoints.
7. `RequireAuth` and `RequireAdmin` in React guard route access.

Major issue: there is an `env.JWT_SECRET || 'development-secret'` fallback, which is not acceptable for production.

### 1.5 API structure

Current APIs are basic and modular, but still minimal:

- `/api/auth` → register, login, me
- `/api/guests` → list/create/update/delete guest records
- `/api/bookings` → list rooms, list bookings, create booking, update status
- `/api/complaints` → list/create/respond
- `/api/feedback` → list/create/summary
- `/api/admin` → dashboard stats

The route layer is light and fast to understand, but the architecture is too thin for production: there is no repository layer, no validator layer, no service layer, no permission model beyond `admin`, and no standard API error contract.

### 1.6 Database structure

The database design includes a basic hotel structure:

- users
- guests
- rooms
- bookings
- complaints
- feedback

This is useful, but it does not yet cover the required production hotel CRM model:

- roles table / role mapping
- room types as a proper reference table
- housekeeping workflow
- maintenance tickets
- payments and billing ledger
- notifications
- audit logs
- booking reference numbers and status history
- room status lifecycle and housekeeping states

### 1.7 Frontend structure

Frontend is organized by pages and components, which is fine for a medium-size app:

- `App.js` handles routing
- `Layout.js` handles shell/navigation
- `RouteGuards.js` handles auth/admin guarding
- `AuthContext.js` centralizes auth state
- Pages such as Guests, Bookings, Complaints, Feedback, Dashboard handle the business pages

This architecture is workable, but it is still a single-page, screen-by-screen MVP rather than a deeper, more organized operations interface.

---

## 2) Existing feature inventory

The project already includes the following modules:

1. User registration and login
2. Guest management
3. Booking and room inventory
4. Complaint handling
5. Feedback collection
6. Admin dashboard
7. JWT authentication
8. Password hashing with bcryptjs
9. Basic route-based authorization
10. Basic API health check
11. Seed admin creation utility

This is a respectable final-year MVP, but it is still missing the production functions described in the transformation brief.

---

## 3) Critical problems

### 3.1 Architecture problems

- `backend/src` and root-level `backend/` contain overlapping files and duplicate app entry points.
- Code paths are split between `backend/` and `backend/src/` with mixed conventions.
- HTTP controllers contain database queries directly instead of using services/repositories.
- Business rules are not isolated in a reusable rule layer.
- Validation is not centralized.
- No migration system or schema versioning exists.
- No test suite exists.

### 3.2 Security problems

- JWT secret falls back to `'development-secret'` when env is missing.
- Default admin credentials exist in `backend/seed.js` and README (`admin@hotelcrm.com` / `Admin@123`).
- `sessionStorage` stores user token and user object; not ideal for sensitive auth data.
- CORS is permissive and not production-hardened (`origin: process.env.CLIENT_URL || true`).
- No `helmet`, no HSTS, no content security policy, no request size hardening beyond one body limit.
- No rate limiting or brute-force protection.
- No audit trail for auth events and privileged actions.
- No centralized authz policy beyond `role === 'admin'` in one middleware.
- The app exposes route paths, messages, and troubleshooting-level detail in errors.
- No CSRF protection is implemented for browser-based cookie auth; this project is not using cookies, but the app still needs explicit CSRF defense if any session tokens ever become cookie-based.

### 3.3 Data and database weaknesses

- `database/schema.sql` is described as MySQL in the README but is written in Supabase/PostgreSQL syntax (`BIGSERIAL`, `TIMESTAMPTZ`, `ON CONFLICT`).
- This is a major inconsistency and creates deployment confusion.
- Multiple required production tables are missing: roles, payments, notifications, audit logs, housekeeping, maintenance, room history, booking references, payments ledger, etc.
- No indexes are defined for common lookup patterns like guest email/phone, room status, booking date overlap, or complaint queries.
- `bookings` lacks a proper booking reference, guest count, notes, source, and status history.
- `rooms` is too simple and does not model room status lifecycle for hotel operations.
- `users` role validation is weak and does not support a solid RBAC model.
- `complaints` has status but no ticket priority, assignment, escalation, or audit fields.
- There are no `updated_at` timestamps for most operational tables.
- There are no soft-delete or audit fields for important data changes.
- No booking overlap prevention is implemented using transactional integrity beyond basic application logic.

### 3.4 Backend weaknesses

- Controllers are doing business logic, data access, and validation in one place.
- Duplicate or conflicting SQL patterns exist between root and `src` versions.
- There is no reusable “service” architecture.
- Error handling is generic but inconsistent; the API does not use a standard response envelope across all endpoints.
- Logging is minimal and mostly console-based.
- No transaction wrapper around booking creation or payment flows.
- No route-specific rate limiting.
- No pagination on list endpoints.
- No filtering or sorting semantics beyond basic frontend-side filtering.
- No health endpoint that checks dependencies beyond a simple status message.

### 3.5 Frontend weaknesses

- The frontend is functional but still uses a basic `sessionStorage` auth model.
- There is no server-side pagination or debounced searching; filtering is local only.
- Many pages have minimal validation and inconsistent UX patterns.
- Loading and empty states exist in some screens, but not uniformly across all workflows.
- Error states are not standardized.
- Accessibility features are basic and not systematically implemented.
- Some UI patterns remain functional but not professional enough for hotel operations.
- There is no robust modals, forms, or table patterns beyond simple CRUD screens.

---

## 4) Security risk review

### 4.1 Weak JWT implementation

The code uses a JWT but has the following issues:

- default fallback secret
- no short-lived token policy enforcement beyond a default `8h` lifetime
- no refresh token strategy or rotation strategy
- no token revocation list or logout invalidation mechanism
- no role/permission claims beyond a simple `role` field
- no token blacklist or server-side session tracking

### 4.2 Insecure secrets and defaults

`backend/seed.js` and the project README both expose default admin credentials. This is a strong risk for local development and a bad habit for production.

Risk areas:

- placeholder or missing `.env` values
- `JWT_SECRET` fallback to `'development-secret'`
- default admin email/password in code comments and docs
- environment and deployment configuration not clearly separated by environment

### 4.3 Missing authorization checks

Authorization is inconsistent:

- `requireAuth` exists for authentication
- `requireAdmin` exists only for the admin stats route
- other privileged operations rely on route-level use of auth but do not enforce roles beyond admin-only stats
- no manager, receptionist, or staff role hierarchy exists
- the admin-only route is not the same as a real RBAC model

### 4.4 Input validation and business validation

Validation is incomplete:

- some required fields are checked, but many common fields are not validated
- email format is not centrally validated
- phone numbers are not normalized or validated
- dates are not validated consistently
- booking overlap logic exists but is not robust enough for production
- IDs and numeric values are not validated centrally

### 4.5 SQL injection and query integrity

The application largely uses parameterized queries, which is a positive sign. However:

- there is no centralized SQL governance
- query patterns are scattered across controllers
- no DB constraints protect many business rules
- no transactional boundaries around multi-step booking or billing flows
- the schema does not enforce hotel-specific integrity rules at the database level

This reduces risk of classic SQL injection, but the system still needs stronger integrity controls.

### 4.6 XSS and frontend security

- The app renders user-provided strings directly in forms and tables without any sanitization strategy beyond basic input handling.
- It is a React app and thus somewhat protected from server-side HTML injection, but unescaped user-driven content still needs sanitization and stronger input controls.
- No strict CSP or anti-clickjacking controls are present.

### 4.7 CORS and exposure concerns

- `cors` is configured in a permissive way and should be restricted by environment and origin allowlist.
- `app.disable('x-powered-by')` is a small improvement, but broader security headers and origin restrictions are still missing.

### 4.8 Missing rate limiting and abuse protections

No rate limiting has been implemented on auth or API routes. This is a production concern because:

- login brute force is possible
- bulk guest or booking creation could be abused
- unauthorized scraping is possible if API is exposed publicly

---

## 5) Database weaknesses

### 5.1 Schema mismatch and incompatibility

The schema is not consistent with the project’s MySQL requirement:

- README says MySQL 8 / MariaDB
- `database/schema.sql` uses PostgreSQL/Supabase conventions: `BIGSERIAL`, `TIMESTAMPTZ`, `ON CONFLICT`

This is a major deployment risk. A MySQL implementation must use MySQL-compatible syntax and explicit table/constraint strategy.

### 5.2 Missing production tables and entities

The current schema does not yet cover important hotel operations:

- roles
- user permissions
- room types as a lookup table
- housekeeping status history
- maintenance tickets
- payments and billing
- payment ledger
- notifications
- audit log entries
- booking references / booking notes
- guest preferences and communication history

### 5.3 Weak integrity and missing constraints

The schema does not yet protect the application strongly enough:

- no indexes on guest names, IDs, phone, email, or room status
- no unique constraints beyond email and room number
- no booking date overlap enforcement at database layer
- no check constraints for many status enum sets beyond a few examples
- no `updated_at` and `created_at` on all operational tables
- no soft-deletion or archival rules
- no consistent naming conventions across entities and fields

### 5.4 Missing audit and history tracking

There is no audit logging layer for:

- login/logout events
- staff changes
- booking changes and cancellations
- room status changes
- payment changes
- complaint updates
- permission changes

This is not just a product feature; it is a compliance and operational necessity.

---

## 6) Backend audit

### 6.1 Controllers review

Current controllers are functional, but they are doing too much:

- request validation
- business rules
- SQL execution
- response shaping

Examples:

- `backend/src/controllers/bookingController.js`
- `backend/src/controllers/guestController.js`
- `backend/src/controllers/complaintController.js`

This should be decomposed into:

- `controllers/*` → HTTP only
- `services/*` → business logic
- `repositories/*` → raw DB interaction
- `validators/*` → schema validation

### 6.2 Routes review

Routes are small and straightforward, which is a strength. However:

- no role-based access middleware beyond `requireAdmin`
- no scope-specific access rules
- no `manager`/`receptionist` role model
- no resource ownership or permission boundaries

### 6.3 Middleware review

The middleware layer includes:

- `requireAuth`
- `requireAdmin`
- `notFoundHandler`
- `errorHandler`

This is a good start, but it is still thin. Production needs:

- standardized API error envelopes
- permission composition middleware (`requireAnyRole`, `requirePermission`)
- request ID tracing and correlation logging
- rate limiting middleware
- structured logging middleware

### 6.4 Services and repositories

The project currently has almost no clear separation between these concepts. The following files exist, but they are not yet a full service/repository architecture:

- `backend/src/services/databaseService.js`
- `backend/src/services/supabaseAuthService.js`

This is a good start for optional Supabase integration, but the current code does not yet use a full repository abstraction across modules.

### 6.5 Error handling

The current error handler is basic but not production-safe:

```js
if (process.env.NODE_ENV !== 'production') {
  console.error(err.stack || err);
}
```

and it may expose stack traces in development. It also responds with a loose message object rather than a standardized code/message structure.

### 6.6 Validation

Current validation is mostly ad hoc and route-level:

- required field checks
- password length check
- booking date check
- complaint status validation
- rating range validation

This is not enough for a production hotel system. Validation should be centralized and consistent.

### 6.7 Response formats

Current API responses are relatively clean but inconsistent:

- some responses use `{ message: '...' }`
- some use raw arrays or objects
- some return `data` under different shapes
- there is no standard `{ success, data, error }` pattern

### 6.8 Logging and observability

There is almost no structured logging layer. The app relies on console calls, which is insufficient for production readiness.

Needs:

- request IDs
- structured JSON logs
- authentication event logs
- database error logs with context
- API metrics / error counters
- health endpoint with dependency health check

### 6.9 Transactions

The project does not yet implement robust transactions around:

- booking creation
- room availability checks + reservation confirmation
- payment recording + booking status changes
- complaint updates and notifications

This is a required business pattern for production-grade hotel operations.

---

## 7) Frontend audit

### 7.1 Component architecture

The app is organized by pages and shared UI pieces, which is acceptable for the current scale. However, the frontend still behaves like a classic student CRUD app, not an enterprise operations interface.

### 7.2 State management

State is kept in React local state and `AuthContext`. This is workable for the current app, but as the system grows it will need:

- stronger data fetching patterns
- reusable query hooks
- centralized request state handling
- table/query state management for large collections

### 7.3 API handling

`frontend/src/api.js` is a lightweight wrapper and is a good foundation. However, it still lacks:

- request/response interceptors
- timeout handling
- retry logic
- central API error shaping
- standardized pagination metadata
- consistent loading/error states

### 7.4 Loading states

Some screens show loading states, but not uniformly. In a production hotel system, all major data tables and forms must have:

- skeleton/loading state
- empty state
- error state
- success feedback

### 7.5 Error states

Errors currently surface as simple strings. This works for a demo, but not for production workflows. Production-grade systems need:

- field-level form validation
- reconcile/confirmation dialogs
- clear contextual messaging
- human-friendly error codes

### 7.6 Forms

The forms are decent but incomplete from a business-process perspective. Missing patterns include:

- inline validation
- date validation
- dependency validation
- bulk operations
- role-based form access
- dirty form warnings

### 7.7 Accessibility

The app is not systematically accessibility-reviewed. Needs improvement for:

- labels and form semantics
- focus styling
- keyboard navigation
- dialog accessibility
- semantically correct tables and tables with headers
- screen reader friendly status messages
- color contrast review

### 7.8 Responsive design

The interface appears functional, but the app still looks more like a basic dashboard than a hotel operations center. The layout needs a more robust, professional, responsive design system.

### 7.9 Route protection

Client-side route protection exists, which is useful, but it is not enough. Backend authorization must remain the source of truth.

---

## 8) Testing audit

The project currently lacks a serious automated test suite.

### Missing testing categories

- unit tests
- integration tests
- API route tests
- auth tests
- role-based authorization tests
- booking availability tests
- overlap prevention tests
- guest CRUD tests
- complaint workflow tests
- feedback validation tests
- frontend tests for critical flows
- end-to-end tests for login → guest → booking → check-in/check-out flow

This is the biggest production gap after security and schema consistency.

---

## 9) Critical production issues to address before implementation

The following are immediate blockers for a production-grade transformation:

1. Fix the MySQL/PostgreSQL schema mismatch.
2. Remove or secure the default/starter admin credentials.
3. Eliminate the JWT fallback secret.
4. Implement real RBAC beyond `admin` vs `staff`.
5. Centralize validation and error handling.
6. Add a service/repository architecture.
7. Define the hotel operations data model for housekeeping, maintenance, billing, notifications, and audit logs.
8. Add migration-based schema management.
9. Add automated tests before scaling the system.
10. Add security headers, rate limiting, and environment separation.

---

## 10) Recommended implementation order

The project should be upgraded in the following order:

1. Architecture hardening (controllers/services/repositories/validators)
2. Security hardening (RBAC, secret management, JWT policy, CORS, rate limiting)
3. Validation layer (centralized request validation)
4. Database hardening and migration strategy
5. Booking engine upgrade (status lifecycle, overlap prevention, room states)
6. Hotel operations (housekeeping, maintenance)
7. Guest CRM 360 (search, history, filtering)
8. Payments and ledger model
9. Notifications
10. Reporting and analytics
11. Audit logging
12. Frontend UX/accessibility improvements
13. Testing and verification
14. Deployment docs and backup strategy

---

## 11) Files that will need modification

The following files are clearly involved in the transformation:

### Backend

- `backend/src/app.js`
- `backend/src/server.js`
- `backend/src/config/db.js`
- `backend/src/config/env.js`
- `backend/src/config/supabase.js`
- `backend/src/controllers/authController.js`
- `backend/src/controllers/guestController.js`
- `backend/src/controllers/bookingController.js`
- `backend/src/controllers/complaintController.js`
- `backend/src/controllers/feedbackController.js`
- `backend/src/controllers/adminController.js`
- `backend/src/middleware/auth.js`
- `backend/src/middleware/errorHandler.js`
- `backend/src/middleware/notFound.js`
- `backend/src/routes/*.js`
- `backend/seed.js`
- `database/schema.sql`

### Frontend

- `frontend/src/App.js`
- `frontend/src/api.js`
- `frontend/src/context/AuthContext.js`
- `frontend/src/components/Layout.js`
- `frontend/src/components/RouteGuards.js`
- `frontend/src/pages/*.js`
- `frontend/src/styles.css`

### Documentation

- `README.md`
- `docs/PRODUCTION_AUDIT.md` (this file)

---

## 12) Files that need to be created

The following should be created during the full production transformation:

- `docs/API.md`
- `docs/BACKUP_AND_RECOVERY.md`
- `docs/DEPLOYMENT.md`
- `.env.example`
- `.gitignore` updates for env files and generated artifacts
- `backend/validators/*.js`
- `backend/services/*.js`
- `backend/repositories/*.js`
- `backend/errors/*.js`
- `backend/tests/*.test.js`
- `backend/migrations/*.sql`
- `frontend/src/components/ui/*.js`
- `frontend/src/hooks/*.js`

---

## 13) Final assessment

Status: Functional MVP, not yet production-ready.

The strongest elements are:

- clear module boundaries
- working authentication flow
- room and booking concepts already in place
- simple CRUD app foundations
- React/Express separation
- existing project docs and module clarity

The weakest elements are:

- security posture
- schema integrity and compatibility
- role-based authorization model
- centralized validation and business rules
- missing hotel-operation data model
- lack of tests, migrations, monitoring, and deployment documentation

This project is a very good candidate for transformation into a production hotel CRM, but it requires disciplined hardening in phases. The next step should not be a UI redesign; it should be a security and architecture remediation pass followed by a proper hotel-operational data model and RBAC design.
