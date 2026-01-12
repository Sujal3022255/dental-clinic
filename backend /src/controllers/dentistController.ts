import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getAllDentists = async (req: Request, res: Response) => {
  try {
    const dentists = await prisma.dentist.findMany({
      include: {
        user: {
          select: {
            email: true,
            createdAt: true,
          },
        },
        availability: true,
      },
    });

    res.json({ dentists });
  } catch (error) {
    console.error('Get dentists error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getDentistById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const dentist = await prisma.dentist.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            email: true,
            createdAt: true,
          },
        },
        availability: true,
        appointments: {
          include: {
            patient: true,
          },
        },
      },
    });

    if (!dentist) {
      return res.status(404).json({ error: 'Dentist not found' });
    }

    res.json({ dentist });
  } catch (error) {
    console.error('Get dentist error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateDentistProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, specialization, phone, bio, experience } = req.body;

    const dentist = await prisma.dentist.update({
      where: { id },
      data: {
        firstName,
        lastName,
        specialization,
        phone,
        bio,
        experience,
      },
    });

    res.json({
      message: 'Dentist profile updated successfully',
      dentist,
    });
  } catch (error) {
    console.error('Update dentist error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const setDentistAvailability = async (req: Request, res: Response) => {
  try {
    const { dentistId } = req.params;
    const { dayOfWeek, startTime, endTime } = req.body;

    const availability = await prisma.availability.create({
      data: {
        dentistId,
        dayOfWeek,
        startTime,
        endTime,
      },
    });

    res.status(201).json({
      message: 'Availability set successfully',
      availability,
    });
  } catch (error) {
    console.error('Set availability error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
