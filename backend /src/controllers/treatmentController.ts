import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';

export const createTreatment = async (req: AuthRequest, res: Response) => {
  try {
    const { appointmentId, diagnosis, procedure, prescription, cost, notes } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Validate required fields
    if (!appointmentId || !diagnosis || !procedure) {
      return res.status(400).json({ 
        error: 'Appointment ID, diagnosis, and procedure are required' 
      });
    }

    // Get appointment with patient info
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { patient: true },
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Check if treatment already exists for this appointment
    const existingTreatment = await prisma.treatment.findUnique({
      where: { appointmentId },
    });

    if (existingTreatment) {
      return res.status(400).json({ 
        error: 'Treatment record already exists for this appointment' 
      });
    }

    const treatment = await prisma.treatment.create({
      data: {
        appointmentId,
        patientId: appointment.patientId,
        diagnosis,
        procedure,
        prescription,
        cost: cost ? parseFloat(cost) : null,
        notes,
      },
      include: {
        appointment: {
          include: {
            dentist: true,
          },
        },
        patient: true,
      },
    });

    // Update appointment status to COMPLETED
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: 'COMPLETED' },
    });

    res.status(201).json({
      message: 'Treatment record created successfully',
      treatment,
    });
  } catch (error) {
    console.error('Create treatment error:', error);
    res.status(500).json({ error: 'Server error while creating treatment' });
  }
};

export const getTreatments = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    let treatments;

    if (userRole === 'PATIENT') {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { patient: true },
      });

      if (!user?.patient) {
        return res.status(404).json({ error: 'Patient profile not found' });
      }

      treatments = await prisma.treatment.findMany({
        where: { patientId: user.patient.id },
        include: {
          appointment: {
            include: {
              dentist: {
                include: {
                  user: {
                    select: { email: true },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else if (userRole === 'DENTIST') {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { dentist: true },
      });

      if (!user?.dentist) {
        return res.status(404).json({ error: 'Dentist profile not found' });
      }

      treatments = await prisma.treatment.findMany({
        where: {
          appointment: {
            dentistId: user.dentist.id,
          },
        },
        include: {
          appointment: {
            include: {
              dentist: true,
            },
          },
          patient: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } else if (userRole === 'ADMIN') {
      treatments = await prisma.treatment.findMany({
        include: {
          appointment: {
            include: {
              dentist: true,
              patient: true,
            },
          },
          patient: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    res.json({ treatments });
  } catch (error) {
    console.error('Get treatments error:', error);
    res.status(500).json({ error: 'Server error while fetching treatments' });
  }
};

export const getTreatmentById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const treatment = await prisma.treatment.findUnique({
      where: { id },
      include: {
        appointment: {
          include: {
            dentist: {
              include: {
                user: {
                  select: { email: true },
                },
              },
            },
          },
        },
        patient: {
          include: {
            user: {
              select: { email: true },
            },
          },
        },
      },
    });

    if (!treatment) {
      return res.status(404).json({ error: 'Treatment not found' });
    }

    // Authorization check
    if (userRole === 'PATIENT') {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { patient: true },
      });

      if (treatment.patientId !== user?.patient?.id) {
        return res.status(403).json({ error: 'Unauthorized access' });
      }
    } else if (userRole === 'DENTIST') {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { dentist: true },
      });

      if (treatment.appointment.dentistId !== user?.dentist?.id) {
        return res.status(403).json({ error: 'Unauthorized access' });
      }
    }

    res.json({ treatment });
  } catch (error) {
    console.error('Get treatment error:', error);
    res.status(500).json({ error: 'Server error while fetching treatment' });
  }
};

export const updateTreatment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { diagnosis, procedure, prescription, cost, notes } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Check if treatment exists
    const existingTreatment = await prisma.treatment.findUnique({
      where: { id },
      include: {
        appointment: {
          include: {
            dentist: true,
          },
        },
      },
    });

    if (!existingTreatment) {
      return res.status(404).json({ error: 'Treatment not found' });
    }

    // Authorization: Only the dentist who created it or admin can update
    if (userRole === 'DENTIST') {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { dentist: true },
      });

      if (existingTreatment.appointment.dentistId !== user?.dentist?.id) {
        return res.status(403).json({ error: 'Unauthorized to update this treatment' });
      }
    } else if (userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    const treatment = await prisma.treatment.update({
      where: { id },
      data: {
        diagnosis,
        procedure,
        prescription,
        cost: cost ? parseFloat(cost) : undefined,
        notes,
      },
      include: {
        appointment: {
          include: {
            dentist: true,
          },
        },
        patient: true,
      },
    });

    res.json({
      message: 'Treatment updated successfully',
      treatment,
    });
  } catch (error) {
    console.error('Update treatment error:', error);
    res.status(500).json({ error: 'Server error while updating treatment' });
  }
};

export const deleteTreatment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Only admin can delete treatments
    if (userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Only administrators can delete treatments' });
    }

    const treatment = await prisma.treatment.findUnique({
      where: { id },
    });

    if (!treatment) {
      return res.status(404).json({ error: 'Treatment not found' });
    }

    await prisma.treatment.delete({
      where: { id },
    });

    res.json({ message: 'Treatment deleted successfully' });
  } catch (error) {
    console.error('Delete treatment error:', error);
    res.status(500).json({ error: 'Server error while deleting treatment' });
  }
};
