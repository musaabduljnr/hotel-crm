# Haven CRM — Hotel Operations & Guest Management System

Haven CRM is a hotel operations and guest relationship platform built with React, Node.js, Express, and MySQL. It is designed for small to medium-sized hotels that need a practical CRM workflow for reservations, guest profiles, room management, maintenance, complaints, satisfaction tracking, and operational reporting.

## What is included

- Staff authentication and role-based access control
- Guest registration and guest profile management
- Booking creation with time-overlap protection and status transitions
- Room inventory and room state tracking
- Housekeeping status management
- Maintenance ticketing and assignment workflow
- Guest CRM search and per-guest dashboard view
- Feedback and complaint lifecycle handling
- Payment recording and operational status updates
- Notifications and audit trail support
- Admin summary dashboard with operational metrics

## Core modules

| # | Module | Status |
|---|--------|--------|
| 1 | Authentication & RBAC | Production-ready |
| 2 | Guest data management | Production-ready |
| 3 | Booking & reservations | Production-ready |
| 4 | Complaints & feedback | Production-ready |
| 5 | Housekeeping & maintenance | Production-ready |
| 6 | Guest CRM / search / profile overview | Production-ready |
| 7 | Payment tracking & notifications | Production-ready |
| 8 | Dashboard analytics | Production-ready |

## Project structure

```
hotel-crm/
├── backend/
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── utils/
│   ├── test/
│   ├── package.json
│   └── .env.example
├── database/
│   ├── migrations/
│   └── schema.sql
├── docs/
│   ├── PRODUCTION_AUDIT.md
│   └── API.md
├── frontend/
│   ├── src/
│   └── public/
├── README.md
└── .env.example
```

## Requirements

- Node.js 18+
- npm
- MySQL 8 or MariaDB
- A local environment or XAMPP-style MySQL setup

## Environment setup

1. Create the backend environment file:
   ```bash
   cd backend
   cp .env.example .env
   ```

2. Fill in your values for the database and JWT secret.

3. Make sure the JWT secret is secure and not a placeholder.

## Database setup

Use the migration-ready schema and seed model:

```bash
mysql -u root -p < database/schema.sql
```

or use the migration folder for a more controlled schema progression:

```bash
database/migrations/001_init_hotel_crm.sql
```

## Backend setup

```bash
cd backend
npm install
npm start
```

Health check:

```bash
curl http://localhost:5000/api/health
```

## Frontend setup

```bash
cd frontend
npm install
npm start
```

## Security and production posture

The backend now includes a more production-oriented setup:

- environment validation for required values
- JWT secret enforcement
- role-based access control
- CORS and security headers
- request rate limiting
- centralized validation layer
- consistent error envelopes
- server-side booking and room lifecycle rules
- operational audit hooks for payments and major actions

## Main API areas

- /api/auth
- /api/guests
- /api/bookings
- /api/complaints
- /api/feedback
- /api/admin
- /api/operations
- /api/guests-crm
- /api/payments
- /api/notifications

See [docs/API.md](docs/API.md) for the API contract.

## Testing

The project includes backend regression tests for the operational layers:

```bash
cd backend
node --test test/*.test.js
```

This verifies the current production-hardening pass and ensures the key workflow rules remain stable.

## Recommended next steps

- connect the frontend to the hardened API routes
- add end-to-end testing for the guest → booking → check-in flow
- add database migration automation and deployment scripts
- expand analytics and reporting modules
- add stricter audit retention and admin reporting policies

## Troubleshooting

- If the backend fails to start, confirm the environment is populated and the JWT secret is valid.
- If MySQL throws connection errors, validate the DB credentials and database existence.
- If a route returns 403, check the user role and route authorization rules.
- If validation errors appear, confirm the request payload matches the documented API contract.
