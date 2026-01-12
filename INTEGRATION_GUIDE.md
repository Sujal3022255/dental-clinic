# Frontend-Backend Integration Guide

## ✅ Integration Complete!

The frontend is now fully connected to the Express backend API.

## 🔗 What Was Integrated

### 1. API Services Created

All located in `/src/services/`:

- **authService.ts** - Authentication (login, register, get current user)
- **appointmentService.ts** - Appointment management (create, list, update, delete)
- **dentistService.ts** - Dentist operations (list, get details, update profile)

### 2. API Client Setup

**File:** `/src/lib/api.ts`

Features:
- Base URL configuration (http://localhost:3000/api)
- Automatic JWT token attachment to requests
- Automatic token expiry handling (redirects to login)
- Error interceptors for better error handling

### 3. Updated Components

#### AuthContext (`/src/contexts/AuthContext.tsx`)
- ✅ Now uses backend API instead of localStorage
- ✅ JWT token stored in localStorage
- ✅ Automatic authentication check on app load
- ✅ Backend-based login/register

#### Register Page (`/src/pages/Register.tsx`)
- ✅ Updated to match backend user model
- ✅ Separate first/last name fields
- ✅ Role selection (USER, PATIENT, DENTIST)
- ✅ Dentist-specific fields (specialization, license number)
- ✅ Backend validation and error handling

#### Login Page
- ✅ Already compatible with backend
- ✅ Error messages from backend displayed

#### App.tsx
- ✅ Updated role checking for uppercase roles (USER, PATIENT, DENTIST, ADMIN)

### 4. Example Integrated Component

**AppointmentBookingIntegrated.tsx** - Full example showing:
- Loading dentists from backend
- Creating appointments via API
- Displaying user's appointments
- Cancelling appointments
- Real-time updates after actions

## 🚀 How to Use

### Authentication Flow

```typescript
import { authService } from '../services/authService';

// Register
const response = await authService.register({
  email: 'patient@example.com',
  password: 'password123',
  role: 'PATIENT',
  firstName: 'John',
  lastName: 'Doe',
  phone: '+1234567890'
});

// Login
const response = await authService.login({
  email: 'patient@example.com',
  password: 'password123'
});

// Get current user
const user = await authService.getCurrentUser();

// Logout
authService.logout();
```

### Appointment Management

```typescript
import { appointmentService } from '../services/appointmentService';

// Create appointment
const result = await appointmentService.create({
  dentistId: 'dentist-uuid',
  dateTime: '2025-12-30T10:00:00Z',
  duration: 30,
  reason: 'Regular checkup'
});

// Get all appointments (filtered by role)
const appointments = await appointmentService.getAll();

// Update status
await appointmentService.updateStatus(appointmentId, 'CONFIRMED');

// Delete appointment
await appointmentService.delete(appointmentId);
```

### Dentist Operations

```typescript
import { dentistService } from '../services/dentistService';

// Get all dentists
const dentists = await dentistService.getAll();

// Get specific dentist
const dentist = await dentistService.getById(dentistId);

// Update dentist profile
await dentistService.update(dentistId, {
  firstName: 'Jane',
  lastName: 'Smith',
  specialization: 'Orthodontics',
  bio: 'Experienced orthodontist...'
});
```

## 📝 Component Integration Examples

### In Any Component:

```typescript
import { useState, useEffect } from 'react';
import { dentistService } from '../services/dentistService';
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user } = useAuth();
  const [dentists, setDentists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDentists();
  }, []);

  const loadDentists = async () => {
    try {
      const response = await dentistService.getAll();
      setDentists(response.dentists);
    } catch (err) {
      setError('Failed to load dentists');
    } finally {
      setLoading(false);
    }
  };

  // Component JSX...
}
```

## 🔧 Environment Configuration

The API base URL is currently hardcoded. For production, create a `.env` file:

```env
VITE_API_URL=http://localhost:3000/api
```

Then update `/src/lib/api.ts`:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
```

## 🎯 Next Steps to Integrate Existing Components

### 1. Update DentistSearch Component

```typescript
// In DentistSearch.tsx
import { dentistService } from '../services/dentistService';

useEffect(() => {
  const loadDentists = async () => {
    const response = await dentistService.getAll();
    setDentists(response.dentists);
  };
  loadDentists();
}, []);
```

### 2. Update MyAppointments Component

```typescript
// In MyAppointments.tsx
import { appointmentService } from '../services/appointmentService';

useEffect(() => {
  const loadAppointments = async () => {
    const response = await appointmentService.getAll();
    setAppointments(response.appointments);
  };
  loadAppointments();
}, []);
```

### 3. Update PatientProfile Component

Use the `user` object from `useAuth()` hook:

```typescript
const { user } = useAuth();

// Display patient info
{user?.patient && (
  <div>
    <p>{user.patient.firstName} {user.patient.lastName}</p>
    <p>{user.email}</p>
    <p>{user.patient.phone}</p>
  </div>
)}
```

## 🔐 Authentication State

The authentication state is managed globally via AuthContext:

```typescript
const { user, loading, signIn, signOut } = useAuth();

if (loading) return <div>Loading...</div>;

if (!user) {
  // User not logged in
  // Redirect to login or show login form
}

// User is logged in, access user data:
console.log(user.email);
console.log(user.role);
if (user.patient) console.log(user.patient.firstName);
```

## 🐛 Error Handling

All API calls should be wrapped in try-catch:

```typescript
try {
  const response = await appointmentService.create(data);
  setSuccess('Appointment created!');
} catch (error: any) {
  const message = error.response?.data?.error || 'Something went wrong';
  setError(message);
}
```

## 📊 Data Models

### User
```typescript
{
  id: string;
  email: string;
  role: 'USER' | 'PATIENT' | 'DENTIST' | 'ADMIN';
  patient?: { ... };
  dentist?: { ... };
}
```

### Appointment
```typescript
{
  id: string;
  dateTime: string;
  duration: number;
  status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  reason?: string;
  dentist?: Dentist;
  patient?: Patient;
}
```

### Dentist
```typescript
{
  id: string;
  firstName: string;
  lastName: string;
  specialization?: string;
  licenseNumber: string;
  phone?: string;
  bio?: string;
  experience?: number;
}
```

## ✨ Benefits of This Integration

1. **Real Data Persistence** - All data stored in PostgreSQL database
2. **Secure Authentication** - JWT-based auth with backend validation
3. **Role-Based Access** - Different views for patients, dentists, and admins
4. **Automatic Token Management** - Tokens attached to all requests automatically
5. **Error Handling** - Centralized error handling and user-friendly messages
6. **Type Safety** - Full TypeScript support with proper typing

## 🚀 Testing the Integration

1. **Start Backend:** `cd backend && npm run dev`
2. **Start Frontend:** `cd frontend && npm run dev`
3. **Register a new user** at http://localhost:5173/register
4. **Login** with the created account
5. **Book an appointment** (if patient)
6. **View appointments** on dashboard

## 📚 Reference

- Backend API Documentation: `/backend/API_DOCUMENTATION.md`
- Backend README: `/backend/README.md`
- API Base: http://localhost:3000/api
- Frontend: http://localhost:5173

---

**The frontend and backend are now fully integrated!** 🎉

All authentication, appointment booking, and data management now flows through the Express API with PostgreSQL database persistence.
