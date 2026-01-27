import crypto from 'crypto';
import prisma from '../utils/prisma';

/**
 * Generate a 6-digit OTP
 */
export const generateOTP = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Create and store OTP for email verification
 * @param email - User's email address
 * @param userId - Optional user ID if user already exists
 * @returns The generated OTP
 */
export const createOTP = async (email: string, userId?: string): Promise<string> => {
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

  // Delete any existing unverified OTPs for this email
  await prisma.emailOTP.deleteMany({
    where: {
      email,
      verified: false,
    },
  });

  // Create new OTP
  await prisma.emailOTP.create({
    data: {
      email,
      otp,
      expiresAt,
      userId: userId || null,
    },
  });

  return otp;
};

/**
 * Verify OTP for email
 * @param email - User's email address
 * @param otp - OTP to verify
 * @returns true if OTP is valid, false otherwise
 */
export const verifyOTP = async (email: string, otp: string): Promise<boolean> => {
  const otpRecord = await prisma.emailOTP.findFirst({
    where: {
      email,
      otp,
      verified: false,
      expiresAt: {
        gt: new Date(), // Not expired
      },
    },
  });

  if (!otpRecord) {
    return false;
  }

  // Mark OTP as verified
  await prisma.emailOTP.update({
    where: { id: otpRecord.id },
    data: { verified: true },
  });

  return true;
};

/**
 * Clean up expired OTPs (run this periodically)
 */
export const cleanupExpiredOTPs = async (): Promise<void> => {
  await prisma.emailOTP.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });
};

/**
 * Resend OTP - creates a new OTP and invalidates old ones
 */
export const resendOTP = async (email: string): Promise<string> => {
  return await createOTP(email);
};

/**
 * Check if user can request OTP (rate limiting)
 * @param email - User's email
 * @returns true if user can request OTP, false if too many recent requests
 */
export const canRequestOTP = async (email: string): Promise<boolean> => {
  const recentOTPs = await prisma.emailOTP.count({
    where: {
      email,
      createdAt: {
        gte: new Date(Date.now() - 5 * 60 * 1000), // Last 5 minutes
      },
    },
  });

  // Allow max 3 OTP requests in 5 minutes
  return recentOTPs < 3;
};
