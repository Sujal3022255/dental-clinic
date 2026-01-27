import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';
import { createOTP, verifyOTP, resendOTP, canRequestOTP } from '../services/otpService';
import { sendOTPEmail } from '../services/emailService';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

// Temporary storage for pending registrations (in production, use Redis or database)
const pendingRegistrations = new Map<string, {
  email: string;
  password: string;
  role: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  specialization?: string;
  licenseNumber?: string;
  expiresAt: number;
}>();

/**
 * Step 1: Initiate registration - Send OTP
 */
export const initiateRegistration = async (req: Request, res: Response) => {
  try {
    const { email, password, role, firstName, lastName, phone, specialization, licenseNumber } = req.body;

    // Validate required fields
    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Email, password, and role are required' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Check OTP rate limiting
    const canRequest = await canRequestOTP(email);
    if (!canRequest) {
      return res.status(429).json({ 
        error: 'Too many OTP requests. Please try again in 5 minutes.' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Store registration data temporarily (expires in 15 minutes)
    pendingRegistrations.set(email, {
      email,
      password: hashedPassword,
      role,
      firstName,
      lastName,
      phone,
      specialization,
      licenseNumber,
      expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes
    });

    // Generate and send OTP
    const otp = await createOTP(email);
    
    try {
      await sendOTPEmail(email, otp, firstName);
      console.log(`📧 OTP sent to ${email}: ${otp}`); // Remove in production
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Continue even if email fails - OTP is still valid
    }

    res.status(200).json({
      message: 'OTP sent to your email. Please verify to complete registration.',
      email,
      // In development, include OTP in response (REMOVE IN PRODUCTION)
      ...(process.env.NODE_ENV === 'development' && { otp }),
    });
  } catch (error) {
    console.error('Registration initiation error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

/**
 * Step 2: Verify OTP and complete registration
 */
export const verifyOTPAndRegister = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    // Get pending registration
    const pendingReg = pendingRegistrations.get(email);
    if (!pendingReg) {
      return res.status(400).json({ 
        error: 'No pending registration found. Please start registration again.' 
      });
    }

    // Check if expired
    if (Date.now() > pendingReg.expiresAt) {
      pendingRegistrations.delete(email);
      return res.status(400).json({ 
        error: 'Registration session expired. Please start again.' 
      });
    }

    // Verify OTP
    const isValid = await verifyOTP(email, otp);
    if (!isValid) {
      return res.status(400).json({ 
        error: 'Invalid or expired OTP. Please try again.' 
      });
    }

    // Create user with related profile
    let user;
    
    if (pendingReg.role === 'PATIENT') {
      user = await prisma.user.create({
        data: {
          email: pendingReg.email,
          password: pendingReg.password,
          role: pendingReg.role as any,
          emailVerified: true,
          patient: {
            create: {
              firstName: pendingReg.firstName || '',
              lastName: pendingReg.lastName || '',
              phone: pendingReg.phone || null,
            },
          },
        },
        include: {
          patient: true,
        },
      });
    } else if (pendingReg.role === 'DENTIST') {
      if (!pendingReg.licenseNumber) {
        return res.status(400).json({ error: 'License number is required for dentists' });
      }
      
      user = await prisma.user.create({
        data: {
          email: pendingReg.email,
          password: pendingReg.password,
          role: pendingReg.role as any,
          emailVerified: true,
          dentist: {
            create: {
              firstName: pendingReg.firstName || '',
              lastName: pendingReg.lastName || '',
              phone: pendingReg.phone || null,
              specialization: pendingReg.specialization || null,
              licenseNumber: pendingReg.licenseNumber,
            },
          },
        },
        include: {
          dentist: true,
        },
      });
    } else {
      user = await prisma.user.create({
        data: {
          email: pendingReg.email,
          password: pendingReg.password,
          role: pendingReg.role as any,
          emailVerified: true,
        },
      });
    }

    // Clear pending registration
    pendingRegistrations.delete(email);

    // Generate tokens
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const refreshToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      message: 'Email verified! Registration completed successfully.',
      token,
      refreshToken,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ error: 'Server error during verification' });
  }
};

/**
 * Resend OTP
 */
export const resendOTPHandler = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if pending registration exists
    const pendingReg = pendingRegistrations.get(email);
    if (!pendingReg) {
      return res.status(400).json({ 
        error: 'No pending registration found. Please start registration again.' 
      });
    }

    // Check OTP rate limiting
    const canRequest = await canRequestOTP(email);
    if (!canRequest) {
      return res.status(429).json({ 
        error: 'Too many OTP requests. Please try again in 5 minutes.' 
      });
    }

    // Generate and send new OTP
    const otp = await resendOTP(email);
    
    try {
      await sendOTPEmail(email, otp, pendingReg.firstName);
      console.log(`📧 OTP resent to ${email}: ${otp}`); // Remove in production
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    res.status(200).json({
      message: 'New OTP sent to your email.',
      // In development, include OTP in response (REMOVE IN PRODUCTION)
      ...(process.env.NODE_ENV === 'development' && { otp }),
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ error: 'Server error while resending OTP' });
  }
};

// Original registration endpoint (fallback for non-OTP flow)
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, role, firstName, lastName, phone, specialization, licenseNumber } = req.body;

    // Validate required fields
    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Email, password, and role are required' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with related profile
    let user;
    
    if (role === 'PATIENT') {
      user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role,
          patient: {
            create: {
              firstName: firstName || '',
              lastName: lastName || '',
              phone: phone || null,
            },
          },
        },
        include: {
          patient: true,
        },
      });
    } else if (role === 'DENTIST') {
      if (!licenseNumber) {
        return res.status(400).json({ error: 'License number is required for dentists' });
      }
      
      user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role,
          dentist: {
            create: {
              firstName: firstName || '',
              lastName: lastName || '',
              phone: phone || null,
              specialization: specialization || null,
              licenseNumber,
            },
          },
        },
        include: {
          dentist: true,
        },
      });
    } else {
      user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role,
        },
      });
    }

    // Generate access token (expires in 24 hours)
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Generate refresh token (expires in 7 days)
    const refreshToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      message: 'User registered successfully',
      token,
      refreshToken,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        patient: true,
        dentist: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate access token (expires in 24 hours)
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Generate refresh token (expires in 7 days)
    const refreshToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      message: 'Login successful',
      token,
      refreshToken,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        patient: true,
        dentist: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;

    const newAccessToken = jwt.sign(
      { id: decoded.id, email: decoded.email, role: decoded.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      token: newAccessToken,
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};

// Cleanup expired pending registrations periodically
setInterval(() => {
  const now = Date.now();
  for (const [email, data] of pendingRegistrations.entries()) {
    if (now > data.expiresAt) {
      pendingRegistrations.delete(email);
    }
  }
}, 5 * 60 * 1000); // Every 5 minutes
