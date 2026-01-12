import 'dotenv/config';
import bcrypt from 'bcryptjs';
import prisma from '../src/utils/prisma';

async function main() {
  console.log('Starting seed...');

  // Create admin user
  const adminEmail = 'admin@dentalclinic.com';
  const adminPassword = 'admin123';

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log('✅ Admin user already exists');
  } else {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    console.log('✅ Admin user created successfully!');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    console.log('User ID:', admin.id);
  }

  // Create sample dentists
  const dentists = [
    {
      email: 'bijay.shah@dentalclinic.com',
      password: 'dentist123',
      firstName: 'Bijay',
      lastName: 'Shah Tali',
      specialization: 'Orthodontics',
      licenseNumber: '54B23A',
      phone: '9828592942',
      bio: 'Dr. Bijay Shah Tali - Expert in General Dentistry with 12 years of experience, dedicated to creating healthy, beautiful smiles.',
      experience: 12,
    },
    {
      email: 'aayush.mehta@dentalclinic.com',
      password: 'dentist123',
      firstName: 'Aayush',
      lastName: 'Mehta',
      specialization: 'Endodontics',
      licenseNumber: 'DDS-2024-102',
      phone: '+9779841234568',
      bio: 'Expert in root canal treatments and endodontic procedures',
      experience: 8,
    },
    {
      email: 'anand.sharma@dentalclinic.com',
      password: 'dentist123',
      firstName: 'Anand',
      lastName: 'Sharma',
      specialization: 'Periodontics',
      licenseNumber: 'DDS-2024-103',
      phone: '+9779841234569',
      bio: 'Specialist in gum disease treatment and dental implants',
      experience: 15,
    },
    {
      email: 'jhatuu.don@dentalclinic.com',
      password: 'dentist123',
      firstName: 'Jhatuu',
      lastName: 'Don',
      specialization: 'Cosmetic Dentistry',
      licenseNumber: 'DDS-2024-104',
      phone: '+9779841234570',
      bio: 'Expert in cosmetic procedures, teeth whitening, and smile makeovers',
      experience: 10,
    },
  ];

  for (const dentistData of dentists) {
    const existingDentist = await prisma.user.findUnique({
      where: { email: dentistData.email },
    });

    if (!existingDentist) {
      const dentistHashedPassword = await bcrypt.hash(dentistData.password, 10);

      await prisma.user.create({
        data: {
          email: dentistData.email,
          password: dentistHashedPassword,
          role: 'DENTIST',
          dentist: {
            create: {
              firstName: dentistData.firstName,
              lastName: dentistData.lastName,
              specialization: dentistData.specialization,
              licenseNumber: dentistData.licenseNumber,
              phone: dentistData.phone,
              bio: dentistData.bio,
              experience: dentistData.experience,
            },
          },
        },
      });

      console.log(`✅ Dentist created: Dr. ${dentistData.firstName} ${dentistData.lastName}`);
    }
  }

  // Optionally create sample patient
  const patientEmail = 'patient@dentalclinic.com';
  const patientPassword = 'patient123';

  const existingPatient = await prisma.user.findUnique({
    where: { email: patientEmail },
  });

  if (!existingPatient) {
    const patientHashedPassword = await bcrypt.hash(patientPassword, 10);

    const patient = await prisma.user.create({
      data: {
        email: patientEmail,
        password: patientHashedPassword,
        role: 'PATIENT',
        patient: {
          create: {
            firstName: 'John',
            lastName: 'Doe',
            phone: '+1987654321',
          },
        },
      },
    });

    console.log('✅ Sample patient created!');
    console.log('Email:', patientEmail);
    console.log('Password:', patientPassword);
  }

  console.log('\n🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
