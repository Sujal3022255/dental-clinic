# Dental Management System - Backend

## Overview
Express.js backend for the Dental Management System with PostgreSQL database and Prisma ORM.

## Tech Stack
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (to be implemented)

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Database
1. Install PostgreSQL (if not already installed)
2. Create a new database named `dental_management`
3. Copy `.env.example` to `.env` and update the `DATABASE_URL` with your database credentials:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/dental_management?schema=public"
   ```

### 3. Using PgAdmin (Optional)
1. Download and install [PgAdmin](https://www.pgadmin.org/download/)
2. Open PgAdmin and create a new server connection
3. Use the same credentials as in your `.env` file

### 4. Run Prisma Migrations
```bash
npm run prisma:generate
npm run prisma:migrate
```

### 5. Start Development Server
```bash
npm run dev
```

The server will start at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio (Database GUI)

## Database Schema

The application includes the following models:
- **User**: Authentication and user management
- **Patient**: Patient profiles and information
- **Dentist**: Dentist profiles and credentials
- **Appointment**: Appointment scheduling
- **Treatment**: Treatment records and history
- **Availability**: Dentist availability schedule

## API Endpoints

### Health Check
- `GET /health` - Server health check

### API Base
- `GET /api` - API welcome message

## Project Structure
```
backend/
├── src/
│   ├── controllers/     # Request handlers
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── middleware/      # Custom middleware
│   ├── utils/           # Utility functions
│   └── index.ts         # Entry point
├── prisma/
│   └── schema.prisma    # Database schema
├── .env                 # Environment variables
└── package.json
```

## Next Steps
1. Set up your PostgreSQL database
2. Configure environment variables
3. Run migrations to create database tables
4. Start implementing API endpoints
5. Add authentication middleware
6. Connect with the frontend application

## Notes
- Make sure PostgreSQL is running before starting the server
- Use Prisma Studio (`npm run prisma:studio`) to view and manage your database
- Keep your `.env` file secure and never commit it to version control
