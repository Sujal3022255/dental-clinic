import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';
import { sendAppointmentConfirmation, sendAppointmentStatusUpdate } from '../services/emailService';

export const createAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { dentistId, dateTime, duration, reason } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Get patient ID from user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { patient: true },
    });

    if (!user?.patient) {
      return res.status(400).json({ error: 'Patient profile not found' });
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId: user.patient.id,
        dentistId,
        dateTime: new Date(dateTime),
        duration: duration || 30,
        reason,
        status: 'PENDING', // New appointments start as PENDING
      },
      include: {
        dentist: {
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        patient: {
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });

    // Send confirmation email (async, don't wait)
    sendAppointmentConfirmation(appointment as any).catch(err => 
      console.error('Email send failed:', err)
    );

    res.status(201).json({
      message: 'Appointment created successfully',
      appointment,
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAppointments = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    let appointments;

    if (userRole === 'PATIENT') {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { patient: true },
      });

      appointments = await prisma.appointment.findMany({
        where: { patientId: user?.patient?.id },
        include: {
          dentist: {
            include: {
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
        },
        orderBy: { dateTime: 'desc' },
      });
    } else if (userRole === 'DENTIST') {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { dentist: true },
      });

      appointments = await prisma.appointment.findMany({
        where: { dentistId: user?.dentist?.id },
        include: {
          patient: {
            include: {
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
        },
        orderBy: { dateTime: 'desc' },
      });
    } else if (userRole === 'ADMIN') {
      appointments = await prisma.appointment.findMany({
        include: {
          patient: {
            include: {
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
          dentist: {
            include: {
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
        },
        orderBy: { dateTime: 'desc' },
      });
    }

    res.json({ appointments });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateAppointmentStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const appointment = await prisma.appointment.update({
      where: { id },
      data: { status },
      include: {
        patient: true,
        dentist: true,
      },
    });

    res.json({
      message: 'Appointment status updated',
      appointment,
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.appointment.delete({
      where: { id },
    });

    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Cancel appointment - allows patients to cancel their own appointments
export const cancelAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Get the appointment to verify ownership
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: { include: { user: true } },
      },
    });

    if (!existingAppointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Check if user is the patient or admin/dentist
    const isPatient = existingAppointment.patient.userId === userId;
    const isDentist = userRole === 'DENTIST';
    const isAdmin = userRole === 'ADMIN';

    if (!isPatient && !isDentist && !isAdmin) {
      return res.status(403).json({ error: 'Not authorized to cancel this appointment' });
    }

    // Update status to CANCELLED
    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        updatedAt: new Date(),
      },
      include: {
        patient: {
          include: { user: { select: { email: true } } },
        },
        dentist: {
          include: { user: { select: { email: true } } },
        },
      },
    });

    res.json({
      message: 'Appointment cancelled successfully',
      appointment,
    });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Reschedule appointment
export const rescheduleAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { dateTime, reason } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Verify the appointment exists and user has access
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: { include: { user: true } },
        dentist: { include: { user: true } },
      },
    });

    if (!existingAppointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Check if user is the patient or a dentist/admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { patient: true, dentist: true },
    });

    const isPatient = user?.patient?.id === existingAppointment.patientId;
    const isDentist = user?.dentist?.id === existingAppointment.dentistId;
    const isAdmin = user?.role === 'ADMIN';

    if (!isPatient && !isDentist && !isAdmin) {
      return res.status(403).json({ error: 'Not authorized to reschedule this appointment' });
    }

    // Update the appointment - set back to PENDING status
    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        dateTime: new Date(dateTime),
        reason: reason || existingAppointment.reason,
        status: 'PENDING', // Reset to pending after reschedule
        updatedAt: new Date(),
      },
      include: {
        patient: {
          include: { user: { select: { email: true } } },
        },
        dentist: {
          include: { user: { select: { email: true } } },
        },
      },
    });

    res.json({
      message: 'Appointment rescheduled successfully',
      appointment,
    });
  } catch (error) {
    console.error('Reschedule appointment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Approve appointment (for dentists)
export const approveAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Only dentists and admins can approve
    if (userRole !== 'DENTIST' && userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Only dentists can approve appointments' });
    }

    const appointment = await prisma.appointment.update({
      where: { id },
      data: { 
        status: 'SCHEDULED',
        updatedAt: new Date(),
      },
      include: {
        patient: {
          include: { user: { select: { email: true } } },
        },
        dentist: {
          include: { user: { select: { email: true } } },
        },
      },
    });

    res.json({
      message: 'Appointment approved successfully',
      appointment,
    });
  } catch (error) {
    console.error('Approve appointment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Reject appointment (for dentists)
export const rejectAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Only dentists and admins can reject
    if (userRole !== 'DENTIST' && userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Only dentists can reject appointments' });
    }

    const appointment = await prisma.appointment.update({
      where: { id },
      data: { 
        status: 'CANCELLED',
        notes: reason ? `Rejected: ${reason}` : 'Rejected by dentist',
        updatedAt: new Date(),
      },
      include: {
        patient: {
          include: { user: { select: { email: true } } },
        },
        dentist: {
          include: { user: { select: { email: true } } },
        },
      },
    });

    res.json({
      message: 'Appointment rejected',
      appointment,
    });
  } catch (error) {
    console.error('Reject appointment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
