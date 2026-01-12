import prisma from './src/utils/prisma';

async function updatePatientProfile() {
  try {
    // Find user by email (the one shown in the screenshot)
    let user = await prisma.user.findUnique({
      where: { email: 'purbey12@gmail.com' }
    });

    // If not found, try the new email
    if (!user) {
      user = await prisma.user.findUnique({
        where: { email: 'sujalpurbey15@gmail.com' }
      });
    }

    if (!user) {
      console.log('Creating new patient user...');
      // Create the user if doesn't exist
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('patient123', 10);
      
      user = await prisma.user.create({
        data: {
          email: 'sujalpurbey15@gmail.com',
          password: hashedPassword,
          role: 'PATIENT'
        }
      });

      // Create patient profile
      await prisma.patient.create({
        data: {
          userId: user.id,
          firstName: 'Sujal Kumar',
          lastName: 'Purbey',
          dateOfBirth: new Date('2000-01-15'),
          phone: '9817673302'
        }
      });

      console.log('✅ New patient profile created successfully!');
    } else {
      console.log('Updating existing user...');
      
      // Update user email if needed
      await prisma.user.update({
        where: { id: user.id },
        data: {
          email: 'sujalpurbey15@gmail.com'
        }
      });

      // Update patient profile
      const patient = await prisma.patient.findUnique({
        where: { userId: user.id }
      });

      if (patient) {
        await prisma.patient.update({
          where: { userId: user.id },
          data: {
            firstName: 'Sujal Kumar',
            lastName: 'Purbey',
            phone: '9817673302'
          }
        });
      } else {
        // Create patient profile if doesn't exist
        await prisma.patient.create({
          data: {
            userId: user.id,
            firstName: 'Sujal Kumar',
            lastName: 'Purbey',
            dateOfBirth: new Date('2000-01-15'),
            phone: '9817673302'
          }
        });
      }

      console.log('✅ Patient profile updated successfully!');
    }

    // Display the updated profile
    const updatedUser = await prisma.user.findUnique({
      where: { email: 'sujalpurbey15@gmail.com' },
      include: {
        patient: true
      }
    });

    console.log('\n📋 Updated Profile:');
    console.log('Full Name:', `${updatedUser?.patient?.firstName} ${updatedUser?.patient?.lastName}`);
    console.log('Email:', updatedUser?.email);
    console.log('Phone:', updatedUser?.patient?.phone);
    console.log('\nLogin credentials:');
    console.log('Email: sujalpurbey15@gmail.com');
    console.log('Password: patient123');

  } catch (error) {
    console.error('Error updating patient profile:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updatePatientProfile();
