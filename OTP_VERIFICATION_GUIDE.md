# Email OTP Verification System - Complete Guide

## 🎯 Overview

This system implements secure email-based OTP (One-Time Password) verification for user registration. Users receive a 6-digit code via email which must be entered to complete registration.

## ✅ Features Implemented

### Backend Features
- ✅ **OTP Generation**: Cryptographically secure 6-digit codes using `crypto.randomInt()`
- ✅ **Database Storage**: OTPs stored in PostgreSQL with automatic cleanup
- ✅ **Email Delivery**: HTML email templates with branded styling
- ✅ **Rate Limiting**: Max 3 OTP requests per 5 minutes per email
- ✅ **Expiration**: OTPs expire after 10 minutes
- ✅ **Single Use**: OTPs marked as verified after successful use
- ✅ **Session Management**: Pending registrations expire after 15 minutes
- ✅ **Security**: Password hashed before temporary storage

### Frontend Features
- ✅ **Multi-Step Flow**: Form submission → OTP input → Account creation
- ✅ **OTP Input Component**: 6-digit input with UX enhancements
- ✅ **Auto-Focus**: Automatically focuses next digit
- ✅ **Paste Support**: Paste 6-digit codes directly
- ✅ **Keyboard Navigation**: Arrow keys and Backspace support
- ✅ **Resend OTP**: 60-second cooldown timer
- ✅ **Error Handling**: Clear error messages and validation
- ✅ **Loading States**: Visual feedback during verification

## 🏗️ Architecture

### Database Schema

```sql
-- EmailOTP Model
CREATE TABLE email_otps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  otp TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_email_otps_email ON email_otps(email);

-- User Model Update
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT false;
```

### API Endpoints

#### 1. Initiate Registration
```http
POST /api/auth/register/initiate
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "role": "PATIENT"
}
```

**Response:**
```json
{
  "message": "OTP sent to your email",
  "otp": "123456"  // Only in development mode
}
```

#### 2. Verify OTP and Complete Registration
```http
POST /api/auth/register/verify
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "PATIENT",
    "emailVerified": true
  }
}
```

#### 3. Resend OTP
```http
POST /api/auth/register/resend-otp
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "New OTP sent to your email",
  "otp": "789012"  // Only in development mode
}
```

## 🔐 Security Features

### 1. Rate Limiting
- **OTP Requests**: Max 3 requests per 5 minutes per email
- **Implementation**: Database-based tracking with cleanup
- **Error Message**: "Too many OTP requests. Please try again in X minutes."

### 2. Expiration
- **OTP Lifetime**: 10 minutes from generation
- **Session Lifetime**: 15 minutes for pending registrations
- **Auto-Cleanup**: Expired OTPs removed every 5 minutes

### 3. Single-Use OTPs
- OTPs marked as `verified: true` after successful use
- Prevents replay attacks
- Verification checks both expiration and verified status

### 4. Secure Storage
- OTPs stored in database (not in-memory)
- Passwords hashed with bcrypt before temporary storage
- Email verification flag set on successful registration

### 5. Development Mode
- OTP returned in API response when `NODE_ENV !== 'production'`
- Also logged to console in development
- Makes testing easier without email setup

## 📧 Email Configuration

### Setup Gmail SMTP (Optional)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**: Google Account → Security → App Passwords
3. **Add to .env**:

```bash
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Email Template

The system sends beautifully formatted HTML emails with:
- Gradient header with logo placeholder
- Large, monospaced OTP display (32px font, 8px letter spacing)
- 10-minute expiry warning
- Security reminder
- Fallback plain text version

### Email Fallback

If email credentials are not configured:
- OTP logged to console
- OTP returned in API response (dev mode)
- Registration still works (testing without email setup)

## 🎨 Frontend Components

### OTPInput Component

```tsx
<OTPInput
  length={6}
  onComplete={(otp) => handleVerify(otp)}
  loading={isVerifying}
  error={errorMessage}
/>
```

**Features:**
- Auto-focus on mount and next digit
- Paste support with numeric validation
- Arrow key navigation
- Backspace clears and moves back
- Error state styling (red border)
- Loading state (disabled inputs)

### Register Page Flow

1. **Step 1: Registration Form**
   - Collect user information
   - Validate password strength
   - Submit to `/register/initiate`

2. **Step 2: OTP Verification**
   - Show email address for confirmation
   - 6-digit OTP input
   - Resend button with 60s cooldown
   - Back to form option
   - Submit to `/register/verify`

3. **Step 3: Redirect**
   - Store JWT token
   - Navigate to role-based dashboard
   - Set `emailVerified: true` in user data

## 🧪 Testing Guide

### Manual Testing

#### Test 1: Successful Registration
```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm run dev

# Browser: http://localhost:5173/register
1. Fill registration form
2. Click "Continue"
3. Check console for OTP (dev mode)
4. Enter OTP in verification screen
5. Should redirect to dashboard
```

#### Test 2: Invalid OTP
```bash
1. Complete registration form
2. Enter wrong OTP (e.g., 000000)
3. Should show error: "Invalid or expired OTP"
4. Can retry with correct OTP
```

#### Test 3: Expired OTP
```bash
1. Complete registration form
2. Wait 11 minutes
3. Enter OTP
4. Should show error: "OTP has expired"
5. Click "Resend OTP" to get new code
```

#### Test 4: Rate Limiting
```bash
1. Start registration 4 times with same email
2. 4th request should fail
3. Error: "Too many OTP requests. Please try again in X minutes."
4. Wait 5 minutes and try again
```

#### Test 5: Resend OTP
```bash
1. Complete registration form
2. Click "Resend OTP"
3. Check console for new OTP
4. Counter shows "Resend in 60s"
5. After countdown, can resend again
```

### API Testing with cURL

```bash
# Test 1: Initiate Registration
curl -X POST http://localhost:3000/api/auth/register/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123",
    "firstName": "Test",
    "lastName": "User",
    "phone": "+1234567890",
    "role": "PATIENT"
  }'

# Test 2: Verify OTP (use OTP from response above)
curl -X POST http://localhost:3000/api/auth/register/verify \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "123456"
  }'

# Test 3: Resend OTP
curl -X POST http://localhost:3000/api/auth/register/resend-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

### Automated Testing

Create `/backend/tests/otp.test.ts`:

```typescript
import request from 'supertest';
import app from '../src';

describe('OTP Verification', () => {
  const testEmail = 'otptest@example.com';
  let otp: string;

  it('should initiate registration and send OTP', async () => {
    const res = await request(app)
      .post('/api/auth/register/initiate')
      .send({
        email: testEmail,
        password: 'Test123',
        firstName: 'OTP',
        lastName: 'Test',
        phone: '+1234567890',
        role: 'PATIENT'
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toContain('OTP sent');
    otp = res.body.otp; // Development mode
  });

  it('should verify OTP and complete registration', async () => {
    const res = await request(app)
      .post('/api/auth/register/verify')
      .send({
        email: testEmail,
        otp: otp
      });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.emailVerified).toBe(true);
  });

  it('should reject invalid OTP', async () => {
    const res = await request(app)
      .post('/api/auth/register/verify')
      .send({
        email: testEmail,
        otp: '000000'
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Invalid or expired OTP');
  });
});
```

Run tests:
```bash
cd backend
npm test -- otp.test.ts
```

## 🚀 Production Checklist

### Before Deployment

- [ ] **Email Credentials**: Configure production SMTP credentials
- [ ] **Environment Variables**: Set `NODE_ENV=production`
- [ ] **Database Migration**: Run OTP schema migration
- [ ] **Rate Limiting**: Verify limits are appropriate
- [ ] **SSL/TLS**: Ensure HTTPS for email delivery
- [ ] **Monitoring**: Set up alerts for OTP failures
- [ ] **Logging**: Configure OTP event logging

### Recommended Enhancements

1. **Redis for Pending Registrations**
   - Replace in-memory Map with Redis
   - Better for horizontal scaling
   - Persistent across server restarts

2. **CAPTCHA Integration**
   - Add reCAPTCHA before OTP request
   - Prevents automated abuse
   - Reduces spam registrations

3. **Account Lockout**
   - Lock account after 5 failed OTP attempts
   - Require admin intervention to unlock
   - Prevent brute-force attacks

4. **Audit Logging**
   - Log all OTP generation events
   - Log verification attempts (success/failure)
   - Track IP addresses for suspicious activity

5. **SMS Fallback**
   - Twilio integration for SMS OTP
   - User chooses email or SMS
   - Better deliverability

6. **Email Deliverability**
   - Validate MX records before sending
   - Use SendGrid/Mailgun for production
   - Monitor bounce rates

7. **Configurable OTP Length**
   - Allow 4-8 digit codes
   - Environment variable: `OTP_LENGTH=6`
   - Higher security vs ease of use

## 📊 Monitoring

### Key Metrics to Track

1. **OTP Delivery Success Rate**: % of OTPs successfully sent
2. **OTP Verification Rate**: % of OTPs successfully verified
3. **Average Time to Verify**: Median time from OTP send to verification
4. **Rate Limit Hits**: Number of users hitting rate limits
5. **Expiration Rate**: % of OTPs that expire before use

### Logging Examples

```typescript
// OTP Generation
console.log('[OTP] Generated for', email, 'expires at', expiresAt);

// OTP Verification Success
console.log('[OTP] Verified for', email, 'user', userId);

// OTP Verification Failure
console.log('[OTP] Failed verification for', email, 'reason:', error);

// Rate Limit Hit
console.log('[OTP] Rate limit exceeded for', email, 'attempts:', count);
```

## 🔍 Troubleshooting

### Issue: OTP Email Not Received

**Solutions:**
1. Check spam/junk folder
2. Verify EMAIL_USER and EMAIL_PASS in .env
3. Check console logs for email errors
4. In dev mode, OTP is logged to console
5. Try resending OTP

### Issue: OTP Expired

**Solutions:**
1. OTP valid for 10 minutes - check timestamp
2. Click "Resend OTP" to get new code
3. Complete verification faster
4. Check server timezone configuration

### Issue: Rate Limit Error

**Solutions:**
1. Wait 5 minutes before trying again
2. Check if multiple attempts from same email
3. In testing, clear email_otps table: `DELETE FROM email_otps WHERE email = 'test@example.com'`

### Issue: Invalid OTP Error

**Solutions:**
1. Ensure all 6 digits are entered
2. No spaces or special characters
3. OTP is numeric only
4. Try resending to get fresh code
5. Check for typos in email address

### Issue: Frontend Not Redirecting After Verification

**Solutions:**
1. Check browser console for errors
2. Verify JWT token is being stored
3. Check role-based routing configuration
4. Ensure user.role matches expected value

## 📝 Code Structure

```
backend/
├── prisma/
│   └── schema.prisma              # EmailOTP model + User.emailVerified
├── src/
│   ├── controllers/
│   │   └── authController.ts      # OTP endpoints + original auth
│   ├── services/
│   │   ├── otpService.ts          # OTP generation/verification logic
│   │   └── emailService.ts        # OTP email sending
│   └── routes/
│       └── auth.ts                # OTP routes (/initiate, /verify, /resend-otp)

frontend/
├── src/
│   ├── components/
│   │   └── OTPInput.tsx           # 6-digit OTP input component
│   └── pages/
│       └── Register.tsx           # Multi-step registration flow
```

## 🎓 Best Practices

1. **Never Log OTPs in Production**
   - Use `NODE_ENV` checks
   - Only return OTP in dev mode
   - Encrypt logs if OTPs present

2. **Use Strong OTPs**
   - Crypto-secure random generation
   - Minimum 6 digits
   - Avoid predictable patterns

3. **Implement Rate Limiting**
   - Per-email limits
   - Per-IP limits (additional layer)
   - Exponential backoff

4. **Clear Error Messages**
   - Don't reveal if email exists
   - Generic "Invalid OTP" message
   - Don't expose internal errors

5. **Graceful Degradation**
   - Email service failures should not block testing
   - Fallback to console logging in dev
   - Clear user messaging

## 📚 Additional Resources

- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Node.js Crypto Documentation](https://nodejs.org/api/crypto.html)
- [Nodemailer Documentation](https://nodemailer.com/)
- [Express Rate Limit](https://github.com/express-rate-limit/express-rate-limit)

## 🤝 Support

For issues or questions:
1. Check this documentation first
2. Review error messages in console
3. Test with cURL to isolate frontend/backend issues
4. Check database logs for OTP records
5. Verify email service configuration

---

**Last Updated**: January 27, 2025
**Version**: 1.0.0
**Status**: ✅ Production Ready
