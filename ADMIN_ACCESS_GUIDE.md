# 🔑 Admin Dashboard Access Guide
## Quick Start for Administrators

---

## 📍 Step 1: Create Admin User

### Option A: Using Prisma Seed (Recommended for Production)

1. **Create seed file:** `/backend/prisma/seed.ts`
```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('Admin@2026', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@dentalclinic.com' },
    update: {},
    create: {
      email: 'admin@dentalclinic.com',
      password: adminPassword,
      role: 'ADMIN'
    }
  });
  
  console.log('✅ Admin user created:', admin.email);
  console.log('📧 Email: admin@dentalclinic.com');
  console.log('🔒 Password: Admin@2026');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
```

2. **Run the seed:**
```bash
cd backend
npx ts-node prisma/seed.ts
```

3. **Expected output:**
```
✅ Admin user created: admin@dentalclinic.com
📧 Email: admin@dentalclinic.com
🔒 Password: Admin@2026
```

---

### Option B: Using API Registration (Quick Test)

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@dentalclinic.com",
    "password": "Admin@2026",
    "role": "ADMIN"
  }'
```

**Expected response:**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid-here",
    "email": "admin@dentalclinic.com",
    "role": "ADMIN"
  }
}
```

---

### Option C: Direct Database Insert (PostgreSQL)

```sql
-- Connect to your PostgreSQL database
-- Replace YOUR_HASHED_PASSWORD with bcrypt hash

INSERT INTO users (id, email, password, role, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'admin@dentalclinic.com',
  '$2a$10$CwTycUXWue0Thq9StjUM0uJ8yNyqhkRX9E.ByABY.bL7.j7gPJBVG', -- Password: Admin@2026
  'ADMIN',
  NOW(),
  NOW()
);
```

**To generate your own password hash:**
```bash
cd backend
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('YourPassword', 10).then(console.log);"
```

---

## 🌐 Step 2: Login to Admin Dashboard

### Access URLs

| Environment | Frontend URL | Backend API |
|------------|--------------|-------------|
| **Development** | http://localhost:5173 | http://localhost:3000 |
| **Production** | https://yourdomain.com | https://api.yourdomain.com |

### Login Steps

1. **Navigate to:** http://localhost:5173/login

2. **Enter credentials:**
   - **Email:** `admin@dentalclinic.com`
   - **Password:** `Admin@2026`

3. **Click:** "Sign in to your account" button

4. **Auto-redirect:** You'll be redirected to http://localhost:5173/admin/dashboard

---

## ✅ Step 3: Verify Admin Access

### Browser Console Check

Press `F12` to open Developer Tools, then run:

```javascript
// Check if logged in
const token = localStorage.getItem('token');
console.log('Token:', token ? '✅ Present' : '❌ Missing');

// Check user role
const user = JSON.parse(localStorage.getItem('user') || '{}');
console.log('User Role:', user.role);
console.log('Is Admin:', user.role === 'ADMIN' ? '✅ Yes' : '❌ No');
```

**Expected output:**
```
Token: ✅ Present
User Role: ADMIN
Is Admin: ✅ Yes
```

### Network Tab Check

1. Open **Network** tab in Developer Tools
2. Refresh the page
3. Look for `GET /api/auth/me` request
4. Check response:

```json
{
  "user": {
    "id": "uuid-here",
    "email": "admin@dentalclinic.com",
    "role": "ADMIN",
    "createdAt": "2026-01-12T...",
    "updatedAt": "2026-01-12T..."
  }
}
```

---

## 🎛️ Admin Dashboard Features

### Available Tabs

| Tab | Features | Status |
|-----|----------|--------|
| **📊 Dashboard** | System stats, recent activity | ✅ Working |
| **👥 Patients** | View, add, edit patients | ✅ Working |
| **👨‍⚕️ Dentists** | Manage dentist profiles | ✅ Working |
| **📅 Appointments** | Approve/decline appointments | ✅ Working |
| **⏰ Time Slots** | View dentist schedules | ✅ Working |
| **👤 All Users** | User management | ⚠️ Partial |
| **📝 Content** | Health tips, blogs, documents | ✅ Working |

### Key Actions

#### Add New Dentist
1. Go to **Dentists** tab
2. Click **"+ Add Dentist"**
3. Fill required fields:
   - Full Name
   - Email
   - Phone
   - **License Number** (required)
   - Specialization (optional)
   - Password
4. Click **"Add User"**

#### Approve Appointment
1. Go to **Appointments** tab
2. Find appointment with **PENDING** status
3. Click **"✓ Approve"** button
4. Status changes to **SCHEDULED**

#### Add Health Tip
1. Go to **Content** tab
2. Click **"+ Add Content"**
3. Select type: **Health Tip**
4. Fill title and description
5. Click **"Create Content"**

---

## 🐛 Troubleshooting

### Problem: "Invalid credentials" error

**Solutions:**
1. Check password is exactly: `Admin@2026`
2. Verify user exists in database:
   ```sql
   SELECT * FROM users WHERE email = 'admin@dentalclinic.com';
   ```
3. Check role is 'ADMIN':
   ```sql
   SELECT role FROM users WHERE email = 'admin@dentalclinic.com';
   ```

### Problem: Redirected to Patient/Dentist Dashboard

**Cause:** User role is not 'ADMIN'

**Solution:**
```sql
UPDATE users 
SET role = 'ADMIN' 
WHERE email = 'admin@dentalclinic.com';
```

### Problem: "Server error during login"

**Check:**
1. Backend server running: `http://localhost:3000/health`
2. Database connected: Check terminal logs
3. JWT_SECRET set in `.env` file

### Problem: Token expired

**Current Status:** JWT tokens don't expire (security issue!)

**Workaround:** Clear localStorage and login again
```javascript
localStorage.clear();
window.location.reload();
```

---

## 🔐 Security Best Practices

### Change Default Password

After first login, you should change the default password:

```sql
-- Generate new password hash
-- In backend folder:
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('YourNewStrongPassword', 10).then(console.log);"

-- Update in database
UPDATE users 
SET password = '$2a$10$YOUR_NEW_HASH_HERE' 
WHERE email = 'admin@dentalclinic.com';
```

### Create Additional Admins

**Via Admin Dashboard:**
1. Go to **All Users** tab
2. Click **"+ Add User"**
3. Fill form with role = **Admin**
4. Share credentials securely

**Via API:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "email": "admin2@dentalclinic.com",
    "password": "SecurePassword123!",
    "role": "ADMIN"
  }'
```

---

## 📋 Quick Reference

### Default Admin Credentials
```
Email:    admin@dentalclinic.com
Password: Admin@2026
Role:     ADMIN
```

### Important URLs
```
Login:     http://localhost:5173/login
Dashboard: http://localhost:5173/admin/dashboard
API:       http://localhost:3000/api
Health:    http://localhost:3000/health
```

### Database Connection
```
Host:     localhost
Port:     5432
Database: dental_clinic
User:     postgres
```

### Environment Variables
```bash
# Backend .env
DATABASE_URL="postgresql://user:pass@localhost:5432/dental_clinic"
JWT_SECRET="your-secret-key-here"
PORT=3000
CORS_ORIGIN="http://localhost:5173"
```

---

## 🚀 Next Steps After Login

1. **✅ Add Dentists** - Start by adding at least 2-3 dentists
2. **✅ Configure Time Slots** - Set dentist availability
3. **✅ Add Health Content** - Create tips and blog posts
4. **✅ Test Appointments** - Create test patient and book appointment
5. **✅ Review Settings** - Check all tabs are working

---

**Need Help?** Check [TECHNICAL_SECURITY_ANALYSIS.md](./TECHNICAL_SECURITY_ANALYSIS.md) for detailed system documentation.
