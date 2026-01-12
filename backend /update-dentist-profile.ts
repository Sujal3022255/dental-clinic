import prisma from './src/utils/prisma';

async function updateDentistProfile() {
  try {
    // Find the dentist by email
    const user = await prisma.user.findUnique({
      where: { email: 'bijay.shah@dentalclinic.com' }
    });

    if (!user) {
      console.error('User not found');
      return;
    }

    // Update the dentist profile
    const updatedDentist = await prisma.dentist.update({
      where: { userId: user.id },
      data: {
        experience: 12,
        phone: '9828592942',
        firstName: 'Bijay',
        lastName: 'Shah Tali',
        specialization: 'Orthodontics',
        licenseNumber: '54B23A',
        bio: 'Dr. Bijay Shah Tali - Expert in General Dentistry with 12 years of experience, dedicated to creating healthy, beautiful smiles.'
      }
    });

    console.log('Dentist profile updated successfully:', updatedDentist);
  } catch (error) {
    console.error('Error updating dentist profile:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateDentistProfile();
