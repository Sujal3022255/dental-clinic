# 🦷 Dental Clinic Management System

A comprehensive full-stack dental clinic management system built with React, TypeScript, Express, and PostgreSQL.

## 🌟 Features

### For Patients
- 📅 Book appointments with dentists
- 📋 View appointment history
- 🔍 Search and browse dentists by specialization
- 📊 Access treatment history
- 🚨 Emergency support information

### For Dentists
- 📆 Manage appointment schedule
- ✅ Confirm/update appointment status
- 📝 Add treatment notes and records
- 👥 View patient list
- ⏰ Set availability schedule

### For Administrators
- 📊 Dashboard with system analytics
- 👥 User management (patients, dentists)
- 📅 View all appointments
- 📄 Content management

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP client
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **Prisma** - ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### 1. Clone the repository
```bash
git clone git@github.com:Sujal3022255/dental-clinic.git
cd dental-clinic
```

### 2. Backend Setup

```bash
cd "backend "
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
npm run prisma:migrate

# Seed database with admin user
npm run prisma:seed

# Start backend server
npm run dev
```

Backend runs on `http://localhost:3000`

### 3. Frontend Setup

```bash
cd "frontend "
npm install

# Start frontend dev server
npm run dev
```

Frontend runs on `http://localhost:5173`

## 🔐 Default Credentials

After running the seed script, you can login with:

### Admin
- Email: `admin@dentalclinic.com`
- Password: `admin123`

### Sample Dentist
- Email: `dentist@dentalclinic.com`
- Password: `dentist123`

### Sample Patient
- Email: `patient@dentalclinic.com`
- Password: `patient123`

## 📚 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Appointments
- `POST /api/appointments` - Create appointment
- `GET /api/appointments` - Get all appointments (filtered by role)
- `PATCH /api/appointments/:id/status` - Update appointment status
- `DELETE /api/appointments/:id` - Delete appointment

### Treatments
- `POST /api/treatments` - Create treatment record
- `GET /api/treatments` - Get all treatments (filtered by role)
- `GET /api/treatments/:id` - Get treatment by ID
- `PATCH /api/treatments/:id` - Update treatment
- `DELETE /api/treatments/:id` - Delete treatment

### Dentists
- `GET /api/dentists` - Get all dentists
- `GET /api/dentists/:id` - Get dentist details
- `PATCH /api/dentists/:id` - Update dentist profile
- `POST /api/dentists/:dentistId/availability` - Set availability

## 🗄️ Database Schema

```
User ──┬── Patient ──┬── Appointments ──── Treatment
       │             └── Treatments
       │
       └── Dentist ──┬── Appointments
                     └── Availability
```

## 🚀 Deployment

### Backend
1. Set up PostgreSQL database
2. Configure environment variables
3. Run migrations: `npm run prisma:migrate`
4. Build: `npm run build`
5. Start: `npm start`

### Frontend
1. Build: `npm run build`
2. Deploy `dist/` folder to hosting service (Vercel, Netlify, etc.)

## 📄 License

MIT

## 👥 Author

Sujal Kumar Purbey

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For any queries, please reach out through GitHub issues.
