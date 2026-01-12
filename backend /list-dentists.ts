import prisma from './src/utils/prisma';

async function listAllDentists() {
  try {
    const dentists = await prisma.dentist.findMany({
      include: {
        user: {
          select: {
            email: true
          }
        }
      },
      orderBy: {
        firstName: 'asc'
      }
    });

    console.log('\n📋 All Dentists in Database:\n');
    dentists.forEach((dentist, index) => {
      console.log(`${index + 1}. Dr. ${dentist.firstName} ${dentist.lastName}`);
      console.log(`   Email: ${dentist.user.email}`);
      console.log(`   Specialization: ${dentist.specialization}`);
      console.log(`   License: ${dentist.licenseNumber}`);
      console.log(`   Phone: ${dentist.phone}`);
      console.log(`   Experience: ${dentist.experience} years`);
      console.log('');
    });

    console.log(`✅ Total dentists: ${dentists.length}\n`);
  } catch (error) {
    console.error('Error fetching dentists:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listAllDentists();
