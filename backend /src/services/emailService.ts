import nodemailer from 'nodemailer';
import { Appointment, Patient, Dentist, User } from '@prisma/client';

// Email configuration
const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com';
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || '587');
const EMAIL_USER = process.env.EMAIL_USER || '';
const EMAIL_PASS = process.env.EMAIL_PASS || '';
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@dentalclinic.com';

// Check if email is configured
const isEmailConfigured = EMAIL_USER && EMAIL_PASS;

// Create reusable transporter only if credentials are provided
let transporter: nodemailer.Transporter | null = null;

if (isEmailConfigured) {
  transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: EMAIL_PORT === 465, // true for 465, false for other ports
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });
}

// Verify transporter configuration
export const verifyEmailConfig = async (): Promise<boolean> => {
  if (!isEmailConfigured) {
    console.log('ℹ️  Email service not configured. Email notifications will be disabled.');
    console.log('   To enable emails, add EMAIL_USER and EMAIL_PASS to your .env file');
    return false;
  }

  try {
    await transporter!.verify();
    console.log('✅ Email service is ready');
    return true;
  } catch (error) {
    console.error('❌ Email service error:', error);
    console.log('⚠️  Email notifications will not be sent due to configuration error');
    return false;
  }
};

interface AppointmentWithDetails extends Appointment {
  patient: Patient & { user: User };
  dentist: Dentist & { user: User };
}

// Send OTP verification email
export const sendOTPEmail = async (email: string, otp: string, name?: string): Promise<void> => {
  if (!transporter) {
    console.log('⚠️  Email not configured. OTP:', otp);
    return;
  }

  const mailOptions = {
    from: EMAIL_FROM,
    to: email,
    subject: 'Email Verification - Dental Clinic',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0b8fac 0%, #096f85 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-box { background: white; border: 2px dashed #0b8fac; padding: 20px; margin: 20px 0; text-align: center; border-radius: 10px; }
          .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #0b8fac; font-family: monospace; }
          .info-box { background: #e8f4f8; padding: 15px; margin: 20px 0; border-left: 4px solid #0b8fac; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .warning { color: #ff6b6b; font-size: 14px; margin-top: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🦷 Dental Clinic</h1>
            <p>Email Verification</p>
          </div>
          <div class="content">
            <h2>Hello${name ? ' ' + name : ''}!</h2>
            <p>Thank you for registering with Dental Clinic Management System.</p>
            <p>To complete your registration, please verify your email address using the OTP below:</p>
            
            <div class="otp-box">
              <p style="margin: 0; color: #666; font-size: 14px;">Your Verification Code</p>
              <div class="otp-code">${otp}</div>
              <p style="margin: 10px 0 0 0; color: #666; font-size: 12px;">Valid for 10 minutes</p>
            </div>

            <div class="info-box">
              <p style="margin: 0;"><strong>⏱️ Important:</strong></p>
              <ul style="margin: 10px 0;">
                <li>This OTP will expire in <strong>10 minutes</strong></li>
                <li>Do not share this code with anyone</li>
                <li>If you didn't request this, please ignore this email</li>
              </ul>
            </div>

            <p class="warning">⚠️ For security reasons, never share your OTP with anyone, including our staff.</p>
          </div>
          <div class="footer">
            <p>Dental Clinic Management System</p>
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Email Verification - Dental Clinic

Hello${name ? ' ' + name : ''}!

Thank you for registering with Dental Clinic Management System.

Your verification code is: ${otp}

This code will expire in 10 minutes.

Important:
- Do not share this code with anyone
- If you didn't request this, please ignore this email

Thank you,
Dental Clinic Management System
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to ${email}`);
  } catch (error) {
    console.error('❌ Failed to send OTP email:', error);
    throw error;
  }
};

interface AppointmentWithDetails extends Appointment {
  patient: Patient & { user: User };
  dentist: Dentist & { user: User };
}

// Send appointment confirmation email
export const sendAppointmentConfirmation = async (
  appointment: AppointmentWithDetails
): Promise<void> => {
  if (!EMAIL_USER || !EMAIL_PASS) {
    console.log('⚠️  Email not configured. Skipping confirmation email.');
    return;
  }

  const patientName = `${appointment.patient.firstName} ${appointment.patient.lastName}`;
  const dentistName = `Dr. ${appointment.dentist.firstName} ${appointment.dentist.lastName}`;
  const appointmentDate = new Date(appointment.dateTime).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const mailOptions = {
    from: EMAIL_FROM,
    to: appointment.patient.user.email,
    subject: 'Appointment Confirmation - Dental Clinic',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #0b8fac; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; }
          .details { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #0b8fac; }
          .detail-row { margin: 10px 0; }
          .label { font-weight: bold; color: #0b8fac; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .button { display: inline-block; padding: 12px 30px; background: #0b8fac; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🦷 Appointment Confirmed</h1>
          </div>
          <div class="content">
            <p>Dear ${patientName},</p>
            <p>Your dental appointment has been confirmed. We look forward to seeing you!</p>
            
            <div class="details">
              <div class="detail-row">
                <span class="label">📅 Date & Time:</span> ${appointmentDate}
              </div>
              <div class="detail-row">
                <span class="label">👨‍⚕️ Dentist:</span> ${dentistName}
              </div>
              <div class="detail-row">
                <span class="label">🏥 Specialization:</span> ${appointment.dentist.specialization || 'General Dentistry'}
              </div>
              ${appointment.reason ? `
              <div class="detail-row">
                <span class="label">📋 Reason:</span> ${appointment.reason}
              </div>
              ` : ''}
              <div class="detail-row">
                <span class="label">⏱️ Duration:</span> ${appointment.duration} minutes
              </div>
            </div>

            <p><strong>Important Reminders:</strong></p>
            <ul>
              <li>Please arrive 10 minutes before your appointment time</li>
              <li>Bring your insurance card and ID</li>
              <li>If you need to reschedule, please contact us at least 24 hours in advance</li>
            </ul>

            <p>If you have any questions, please don't hesitate to contact us.</p>
          </div>
          <div class="footer">
            <p>Dental Clinic Management System</p>
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Appointment Confirmation

Dear ${patientName},

Your dental appointment has been confirmed:

Date & Time: ${appointmentDate}
Dentist: ${dentistName}
Specialization: ${appointment.dentist.specialization || 'General Dentistry'}
${appointment.reason ? `Reason: ${appointment.reason}\n` : ''}Duration: ${appointment.duration} minutes

Important Reminders:
- Please arrive 10 minutes before your appointment time
- Bring your insurance card and ID
- If you need to reschedule, please contact us at least 24 hours in advance

Thank you,
Dental Clinic Management System
    `
  };

  try {
    if (!transporter) {
      console.log('⚠️  Email not configured. Skipping confirmation email.');
      return;
    }
    await transporter.sendMail(mailOptions);
    console.log(`✅ Confirmation email sent to ${appointment.patient.user.email}`);
  } catch (error) {
    console.error('❌ Failed to send confirmation email:', error);
  }
};

// Send appointment reminder (24 hours before)
export const sendAppointmentReminder = async (
  appointment: AppointmentWithDetails
): Promise<void> => {
  if (!EMAIL_USER || !EMAIL_PASS) {
    console.log('⚠️  Email not configured. Skipping reminder email.');
    return;
  }

  const patientName = `${appointment.patient.firstName} ${appointment.patient.lastName}`;
  const dentistName = `Dr. ${appointment.dentist.firstName} ${appointment.dentist.lastName}`;
  const appointmentDate = new Date(appointment.dateTime).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const mailOptions = {
    from: EMAIL_FROM,
    to: appointment.patient.user.email,
    subject: 'Appointment Reminder - Tomorrow',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ffa500; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; }
          .reminder-box { background: #fff3cd; border: 2px solid #ffa500; padding: 20px; margin: 20px 0; border-radius: 5px; }
          .details { background: white; padding: 20px; margin: 20px 0; }
          .label { font-weight: bold; color: #ffa500; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 Appointment Reminder</h1>
          </div>
          <div class="content">
            <p>Dear ${patientName},</p>
            
            <div class="reminder-box">
              <h2 style="margin-top: 0; color: #ffa500;">Your appointment is tomorrow!</h2>
              <p style="font-size: 18px; margin: 10px 0;"><strong>${appointmentDate}</strong></p>
            </div>

            <div class="details">
              <p><span class="label">👨‍⚕️ Dentist:</span> ${dentistName}</p>
              <p><span class="label">🏥 Specialization:</span> ${appointment.dentist.specialization || 'General Dentistry'}</p>
              ${appointment.reason ? `<p><span class="label">📋 Reason:</span> ${appointment.reason}</p>` : ''}
            </div>

            <p><strong>Reminders:</strong></p>
            <ul>
              <li>Arrive 10 minutes early</li>
              <li>Bring insurance card and ID</li>
              <li>Contact us if you need to reschedule</li>
            </ul>

            <p>We look forward to seeing you!</p>
          </div>
          <div class="footer">
            <p>Dental Clinic Management System</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    if (!transporter) {
      console.log('⚠️  Email not configured. Skipping reminder email.');
      return;
    }
    await transporter.sendMail(mailOptions);
    console.log(`✅ Reminder email sent to ${appointment.patient.user.email}`);
  } catch (error) {
    console.error('❌ Failed to send reminder email:', error);
  }
};

// Send appointment status update email
export const sendAppointmentStatusUpdate = async (
  appointment: AppointmentWithDetails,
  status: string,
  reason?: string
): Promise<void> => {
  if (!EMAIL_USER || !EMAIL_PASS) {
    console.log('⚠️  Email not configured. Skipping status update email.');
    return;
  }

  const patientName = `${appointment.patient.firstName} ${appointment.patient.lastName}`;
  const appointmentDate = new Date(appointment.dateTime).toLocaleString();

  const statusMessages = {
    SCHEDULED: { title: 'Appointment Approved', color: '#28a745', emoji: '✅' },
    CANCELLED: { title: 'Appointment Cancelled', color: '#dc3545', emoji: '❌' },
    CONFIRMED: { title: 'Appointment Confirmed', color: '#0b8fac', emoji: '✓' },
    COMPLETED: { title: 'Appointment Completed', color: '#6f42c1', emoji: '✓' },
  };

  const statusInfo = statusMessages[status as keyof typeof statusMessages] || statusMessages.SCHEDULED;

  const mailOptions = {
    from: EMAIL_FROM,
    to: appointment.patient.user.email,
    subject: `${statusInfo.title} - Dental Clinic`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: ${statusInfo.color}; color: white; padding: 20px; text-align: center;">
          <h1>${statusInfo.emoji} ${statusInfo.title}</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <p>Dear ${patientName},</p>
          <p>Your appointment scheduled for <strong>${appointmentDate}</strong> has been ${status.toLowerCase()}.</p>
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
          <p>If you have any questions, please contact us.</p>
        </div>
      </div>
    `,
  };

  try {
    if (!transporter) {
      console.log('⚠️  Email not configured. Skipping status update email.');
      return;
    }
    await transporter.sendMail(mailOptions);
    console.log(`✅ Status update email sent to ${appointment.patient.user.email}`);
  } catch (error) {
    console.error('❌ Failed to send status update email:', error);
  }
};

// Send welcome email for new users
export const sendWelcomeEmail = async (email: string, name: string, role: string): Promise<void> => {
  if (!EMAIL_USER || !EMAIL_PASS) {
    console.log('⚠️  Email not configured. Skipping welcome email.');
    return;
  }

  const mailOptions = {
    from: EMAIL_FROM,
    to: email,
    subject: 'Welcome to Dental Clinic Management System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #0b8fac; color: white; padding: 30px; text-align: center;">
          <h1>🦷 Welcome to Our Dental Clinic!</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <p>Dear ${name},</p>
          <p>Thank you for registering with our Dental Clinic Management System!</p>
          <p>Your account has been created as a <strong>${role}</strong>.</p>
          <p>You can now:</p>
          <ul>
            <li>Book appointments online</li>
            <li>View your appointment history</li>
            <li>Access health tips and resources</li>
            <li>Manage your profile</li>
          </ul>
          <p>If you have any questions, feel free to contact us.</p>
          <p>Best regards,<br>Dental Clinic Team</p>
        </div>
      </div>
    `,
  };

  try {
    if (!transporter) {
      console.log('⚠️  Email not configured. Skipping welcome email.');
      return;
    }
    await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${email}`);
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error);
  }
};
