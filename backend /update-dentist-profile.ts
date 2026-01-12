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
        firstName: 'Bijay Kumar',
        lastName: 'Shah Tali'
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
