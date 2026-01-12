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
    console.log('Admin user already exists');
    return;
  }

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

  // Optionally create sample dentist
  const dentistEmail = 'dentist@dentalclinic.com';
  const dentistPassword = 'dentist123';

  const existingDentist = await prisma.user.findUnique({
    where: { email: dentistEmail },
  });

  if (!existingDentist) {
    const dentistHashedPassword = await bcrypt.hash(dentistPassword, 10);

    const dentist = await prisma.user.create({
      data: {
        email: dentistEmail,
        password: dentistHashedPassword,
        role: 'DENTIST',
        dentist: {
          create: {
            firstName: 'Dr. Sarah',
            lastName: 'Johnson',
            specialization: 'General Dentistry',
            licenseNumber: 'DDS-2024-001',
            phone: '+1234567890',
            bio: 'Experienced general dentist with 10+ years of practice',
            experience: 10,
          },
        },
      },
    });

    console.log('✅ Sample dentist created!');
    console.log('Email:', dentistEmail);
    console.log('Password:', dentistPassword);
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
