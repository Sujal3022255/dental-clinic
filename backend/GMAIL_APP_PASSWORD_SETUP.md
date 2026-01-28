# 🔐 Gmail App Password Setup Guide

## ⚠️ CRITICAL: You MUST use Gmail App Password, NOT your regular Gmail password!

### Why App Password is Required:
- Gmail blocks "less secure apps" from using regular passwords
- App Passwords are 16-character tokens specifically for applications
- More secure than using your actual Gmail password

---

## 📋 Step-by-Step Instructions (5 minutes)

### Step 1: Enable 2-Factor Authentication (2FA)
1. Go to: https://myaccount.google.com/security
2. Find "2-Step Verification" section
3. If not enabled, click "Get Started" and follow prompts
4. ✅ Wait for confirmation that 2FA is enabled

### Step 2: Generate App Password
1. Go to: https://myaccount.google.com/apppasswords
   - **OR** Google Account → Security → 2-Step Verification → App Passwords (at bottom)
2. Sign in if prompted
3. Under "Select app" → Choose **"Mail"**
4. Under "Select device" → Choose **"Other (Custom name)"**
5. Enter name: **"Dental Clinic Backend"**
6. Click **"Generate"**
7. 📝 **COPY the 16-character password** (shown in yellow box)
   - Format: `xxxx xxxx xxxx xxxx` (spaces will be removed automatically)
   - ⚠️ You can only see this ONCE - copy it now!

### Step 3: Update .env File
1. Open `/backend/.env` file
2. Replace these two lines:
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-gmail-app-password
   ```
   
   With your actual values:
   ```env
   EMAIL_USER=youremail@gmail.com
   EMAIL_PASS=abcdefghijklmnop
   ```
   
   Example:
   ```env
   EMAIL_USER=dentalclinic2026@gmail.com
   EMAIL_PASS=xmkp qrst uvwx yzab
   ```

3. Save the file

### Step 4: Restart Backend Server
```bash
# Stop current server (Ctrl+C in terminal)
cd /Users/sujalkr.purbey/Downloads/project/backend
npm run dev
```

Look for this message:
```
✅ Email service is ready
✅ Server running on http://localhost:3000
```

### Step 5: Test Email Delivery
1. Open: http://localhost:5174/register
2. Enter a real email address you can access
3. Fill in registration details
4. Click "Register"
5. Check your inbox (and spam folder) for OTP email
6. Enter the 6-digit code to complete registration

---

## 🎯 Quick Validation

Run this after updating .env:
```bash
cd /Users/sujalkr.purbey/Downloads/project/backend
npx ts-node validate-email-config.ts
```

Expected output:
```
✅ Passed: 8/8
🎉 EMAIL CONFIGURATION IS PERFECT!
```

---

## ❌ Common Mistakes to Avoid

1. ❌ Using regular Gmail password → Use App Password
2. ❌ Not enabling 2FA first → Enable 2FA before generating App Password
3. ❌ Keeping spaces in password → Remove spaces: `xxxx xxxx xxxx xxxx` → `xxxxxxxxxxxxxxxx`
4. ❌ Not restarting server → Must restart to reload .env
5. ❌ Using personal email → Consider creating dedicated email like `dentalclinic2026@gmail.com`

---

## 🆘 Troubleshooting

### "App Passwords option not available"
- Enable 2FA first at https://myaccount.google.com/security
- Wait 5 minutes, then try again

### "Invalid credentials" error
- Double-check: no typos, no extra spaces
- Make sure you copied full 16-character App Password
- Verify EMAIL_USER is your full Gmail address

### Emails still not arriving
- Check spam/junk folder
- Verify Gmail account is active and not suspended
- Try sending test email from Gmail web interface first

---

## 📞 Need Help?

If stuck, the validator will tell you exactly what's wrong:
```bash
npx ts-node validate-email-config.ts
```
