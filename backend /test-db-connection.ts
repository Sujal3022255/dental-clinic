import prisma from './src/utils/prisma';
import bcrypt from 'bcryptjs';

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    const count = await prisma.user.count();
    console.log('✓ Database connection successful');
    console.log('✓ Users in database:', count);
    
    // Test creating a user
    const testEmail = `test${Date.now()}@example.com`;
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        password: hashedPassword,
        role: 'PATIENT',
        patient: {
          create: {
            firstName: 'Test',
            lastName: 'User',
            phone: '1234567890',
          },
        },
      },
      include: {
        patient: true,
      },
    });
    
    console.log('✓ Successfully created test user:', user.email);
    console.log('✓ Patient profile created:', user.patient?.firstName, user.patient?.lastName);
    
    // Clean up
    await prisma.user.delete({ where: { id: user.id } });
    console.log('✓ Test user cleaned up');
    
    await prisma.$disconnect();
    console.log('✓ All tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error);
    process.exit(1);
  }
}

testConnection();
