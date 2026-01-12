import prisma from './src/utils/prisma';

async function updateAayushName() {
  try {
    // Find the user with old email
    const user = await prisma.user.findUnique({
      where: { email: 'aayush.mahata@dentalclinic.com' }
    });

    if (!user) {
      console.log('User with email aayush.mahata@dentalclinic.com not found');
      return;
    }

    // Update user email
    await prisma.user.update({
      where: { id: user.id },
      data: {
        email: 'aayush.mehta@dentalclinic.com'
      }
    });

    // Update dentist profile
    await prisma.dentist.update({
      where: { userId: user.id },
      data: {
        lastName: 'Mehta'
      }
    });

    console.log('✅ Updated Aayush Mahata to Aayush Mehta successfully!');
  } catch (error) {
    console.error('Error updating name:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAayushName();
