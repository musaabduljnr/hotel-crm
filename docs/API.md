# Haven CRM API

## Overview

The Haven CRM API provides hotel operations endpoints for authentication, guest management, bookings, complaints, feedback, and admin reporting.

## Base URL

- Local: `http://localhost:5000/api`

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```http
Authorization: Bearer <jwt_token>
```

### Auth endpoints

#### POST /api/auth/register

Creates a new staff account.

Request body:

```json
{
  "full_name": "Jane Smith",
  "email": "jane@hotelcrm.com",
  "password": "StrongPassword123!",
  "role": "staff"
}
```

Response:

```json
{
  "success": true,
  "message": "Account created successfully.",
  "token": "jwt_token",
  "user": {
    "id": 1,
    "full_name": "Jane Smith",
    "email": "jane@hotelcrm.com",
    "role": "staff"
  }
}
```

#### POST /api/auth/login

Request body:

```json
{
  "email": "jane@hotelcrm.com",
  "password": "StrongPassword123!"
}
```

#### GET /api/auth/me

Returns the current authenticated user.

---

## Guest endpoints

### GET /api/guests

Returns guest records.

### POST /api/guests

Request body:

```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone": "+2348000000000",
  "address": "Lagos",
  "id_type": "Passport",
  "id_number": "A12345",
  "preferences": "High floor, non-smoking"
}
```

### GET /api/guests/:id

### PUT /api/guests/:id

### DELETE /api/guests/:id

---

## Booking endpoints

### GET /api/bookings

Returns booking records.

### GET /api/bookings/rooms

Returns room inventory.

### POST /api/bookings

Request body:

```json
{
  "guest_id": 1,
  "room_id": 2,
  "check_in": "2026-10-10",
  "check_out": "2026-10-15",
  "number_of_guests": 2,
  "booking_source": "direct",
  "notes": "Late arrival requested"
}
```

### PUT /api/bookings/:id/status

Request body:

```json
{
  "status": "checked_in"
}
```

---

## Complaints endpoints

### GET /api/complaints

### POST /api/complaints

Request body:

```json
{
  "guest_id": 1,
  "subject": "Room service delay",
  "description": "The room service order took more than 60 minutes to arrive."
}
```

### PUT /api/complaints/:id/respond

Request body:

```json
{
  "status": "resolved",
  "admin_response": "Apology issued and service credit provided."
}
```

---

## Feedback endpoints

### GET /api/feedback

### GET /api/feedback/summary

### POST /api/feedback

Request body:

```json
{
  "guest_id": 1,
  "rating": 5,
  "comment": "Excellent service and clean room."
}
```

---

## Admin endpoints

### GET /api/admin/stats

Returns dashboard summary metrics.

---

## Error format

All errors follow a consistent envelope:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "A valid email address is required."
  }
}
```

Common error codes:

- `AUTH_REQUIRED`
- `INVALID_TOKEN`
- `VALIDATION_ERROR`
- `USER_EXISTS`
- `ROOM_UNAVAILABLE`
- `BOOKING_NOT_FOUND`
- `FORBIDDEN`
- `RATE_LIMITED`

---

## Authorization model

Roles supported:

- `admin`
- `manager`
- `receptionist`
- `staff`

Protected routes enforce role checks on the server side.
