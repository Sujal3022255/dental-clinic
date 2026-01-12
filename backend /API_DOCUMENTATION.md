# Dental Management System - API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
Most endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Auth Endpoints

### Register User
Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "role": "PATIENT" | "DENTIST" | "ADMIN" | "USER",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  
  // For DENTIST role only:
  "specialization": "Orthodontics",
  "licenseNumber": "DDS-12345"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "PATIENT",
    "createdAt": "2025-12-29T...",
    "patient": { ... }
  }
}
```

---

### Login
Authenticate and receive JWT token.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "PATIENT"
  }
}
```

---

### Get Current User
Get logged-in user's profile.

**Endpoint:** `GET /api/auth/me`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "PATIENT",
    "patient": {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+1234567890"
    }
  }
}
```

---

## Dentist Endpoints

### Get All Dentists
Retrieve all dentist profiles (public).

**Endpoint:** `GET /api/dentists`

**Response:**
```json
{
  "dentists": [
    {
      "id": "uuid",
      "firstName": "Dr. Jane",
      "lastName": "Smith",
      "specialization": "Orthodontics",
      "licenseNumber": "DDS-12345",
      "phone": "+1234567890",
      "bio": "Experienced orthodontist...",
      "experience": 10,
      "availability": [...]
    }
  ]
}
```

---

### Get Dentist by ID
Get detailed dentist information.

**Endpoint:** `GET /api/dentists/:id`

**Response:**
```json
{
  "dentist": {
    "id": "uuid",
    "firstName": "Dr. Jane",
    "lastName": "Smith",
    "specialization": "Orthodontics",
    "appointments": [...],
    "availability": [...]
  }
}
```

---

### Update Dentist Profile
Update dentist information (requires DENTIST or ADMIN role).

**Endpoint:** `PATCH /api/dentists/:id`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "firstName": "Dr. Jane",
  "lastName": "Smith",
  "specialization": "Orthodontics",
  "phone": "+1234567890",
  "bio": "Updated bio",
  "experience": 12
}
```

---

### Set Dentist Availability
Set available time slots (requires DENTIST or ADMIN role).

**Endpoint:** `POST /api/dentists/:dentistId/availability`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "dayOfWeek": 1,  // 0=Sunday, 1=Monday, etc.
  "startTime": "09:00",
  "endTime": "17:00"
}
```

---

## Appointment Endpoints

### Create Appointment
Book a new appointment (requires authentication).

**Endpoint:** `POST /api/appointments`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "dentistId": "uuid",
  "dateTime": "2025-12-30T10:00:00Z",
  "duration": 30,
  "reason": "Regular checkup"
}
```

**Response:**
```json
{
  "message": "Appointment created successfully",
  "appointment": {
    "id": "uuid",
    "dateTime": "2025-12-30T10:00:00Z",
    "duration": 30,
    "status": "SCHEDULED",
    "dentist": {...},
    "patient": {...}
  }
}
```

---

### Get Appointments
Get appointments (filtered by user role).

**Endpoint:** `GET /api/appointments`

**Headers:** `Authorization: Bearer <token>`

**Response:**
- **For PATIENT:** Returns their own appointments
- **For DENTIST:** Returns their scheduled appointments
- **For ADMIN:** Returns all appointments

```json
{
  "appointments": [
    {
      "id": "uuid",
      "dateTime": "2025-12-30T10:00:00Z",
      "status": "SCHEDULED",
      "dentist": {...},
      "patient": {...}
    }
  ]
}
```

---

### Update Appointment Status
Change appointment status (requires DENTIST or ADMIN role).

**Endpoint:** `PATCH /api/appointments/:id/status`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "status": "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW"
}
```

---

### Delete Appointment
Cancel/delete an appointment.

**Endpoint:** `DELETE /api/appointments/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "message": "Appointment deleted successfully"
}
```

---

## Error Responses

All endpoints may return these error responses:

**400 Bad Request**
```json
{
  "error": "Validation error message"
}
```

**401 Unauthorized**
```json
{
  "error": "Access token required" | "Not authenticated"
}
```

**403 Forbidden**
```json
{
  "error": "You do not have permission to access this resource"
}
```

**404 Not Found**
```json
{
  "error": "Resource not found"
}
```

**500 Server Error**
```json
{
  "error": "Server error"
}
```

---

## Database Schema

### User Roles
- `USER` - Basic user
- `PATIENT` - Patient with medical records
- `DENTIST` - Healthcare provider
- `ADMIN` - System administrator

### Appointment Statuses
- `SCHEDULED` - Initial booking
- `CONFIRMED` - Dentist confirmed
- `COMPLETED` - Appointment finished
- `CANCELLED` - Cancelled by user/dentist
- `NO_SHOW` - Patient didn't attend

---

## Testing with cURL

### Register a Patient
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient@test.com",
    "password": "password123",
    "role": "PATIENT",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient@test.com",
    "password": "password123"
  }'
```

### Get Dentists
```bash
curl http://localhost:3000/api/dentists
```

### Create Appointment (with auth)
```bash
curl -X POST http://localhost:3000/api/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "dentistId": "dentist-uuid-here",
    "dateTime": "2025-12-30T10:00:00Z",
    "duration": 30,
    "reason": "Regular checkup"
  }'
```

---

## Next Steps

1. **Test all endpoints** using the cURL examples above
2. **Integrate with frontend** - Update the frontend to use these new API endpoints
3. **Add more features:**
   - Password reset functionality
   - Email notifications
   - Treatment records CRUD
   - Patient medical history
   - Billing and invoicing
   - Analytics and reports

For questions or issues, check the server logs or README.md
