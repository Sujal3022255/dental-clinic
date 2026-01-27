import prisma from './src/utils/prisma';

async function analyze() {
  console.log('📊 DATABASE ANALYSIS\n');
  console.log('='.repeat(60));
  
  // Count all records
  const userCount = await prisma.user.count();
  const patientCount = await prisma.patient.count();
  const dentistCount = await prisma.dentist.count();
  const appointmentCount = await prisma.appointment.count();
  const treatmentCount = await prisma.treatment.count();
  const contentCount = await prisma.content.count();
  const otpCount = await prisma.emailOTP.count();
  
  console.log(`\n📈 RECORD COUNTS:`);
  console.log(`   Users:        ${userCount}`);
  console.log(`   Patients:     ${patientCount}`);
  console.log(`   Dentists:     ${dentistCount}`);
  console.log(`   Appointments: ${appointmentCount}`);
  console.log(`   Treatments:   ${treatmentCount}`);
  console.log(`   Content:      ${contentCount}`);
  console.log(`   Email OTPs:   ${otpCount}`);
  
  // Get admin user
  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });
  
  console.log(`\n\n👨‍💼 ADMIN ACCESS:`);
  if (admin) {
    console.log(`   Email:     ${admin.email}`);
    console.log(`   Password:  admin123 (default)`);
    console.log(`   Login URL: http://localhost:5174/login`);
    console.log(`   Dashboard: http://localhost:5174/admin/dashboard`);
  } else {
    console.log(`   ❌ No admin user found!`);
  }
  
  // Get all users by role
  const users = await prisma.user.groupBy({
    by: ['role'],
    _count: { role: true }
  });
  
  console.log(`\n\n👥 USERS BY ROLE:`);
  users.forEach(u => {
    console.log(`   ${u.role}: ${u._count.role}`);
  });
  
  // Check appointments by status
  const appointments = await prisma.appointment.groupBy({
    by: ['status'],
    _count: { status: true }
  });
  
  console.log(`\n\n📅 APPOINTMENTS BY STATUS:`);
  if (appointments.length > 0) {
    appointments.forEach(a => {
      console.log(`   ${a.status}: ${a._count.status}`);
    });
  } else {
    console.log(`   No appointments found`);
  }
  
  // Recent registrations with OTP verification
  const recentUsers = await prisma.user.findMany({
    select: {
      email: true,
      role: true,
      emailVerified: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  
  console.log(`\n\n🆕 RECENT REGISTRATIONS:`);
  recentUsers.forEach((u, i) => {
    const verified = u.emailVerified ? '✅' : '❌';
    console.log(`   ${i+1}. ${u.email} (${u.role}) ${verified} - ${u.createdAt.toLocaleDateString()}`);
  });
  
  // Get all dentists
  const dentists = await prisma.dentist.findMany({
    include: {
      user: {
        select: {
          email: true,
          firstName: true,
          lastName: true
        }
      }
    }
  });
  
  console.log(`\n\n👨‍⚕️ DENTISTS:`);
  dentists.forEach((d, i) => {
    console.log(`   ${i+1}. ${d.user.firstName} ${d.user.lastName} - ${d.specialization || 'General'}`);
    console.log(`      License: ${d.licenseNumber}`);
  });
  
  console.log('\n' + '='.repeat(60));
  
  await prisma.$disconnect();
}

analyze().catch(console.error);
