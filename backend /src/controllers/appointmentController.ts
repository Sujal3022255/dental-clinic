import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';

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
        status: 'SCHEDULED',
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
