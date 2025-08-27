const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function getUserId() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
      },
    });
    
    if (users.length === 0) {
      console.log('❌ No users found in database');
      return;
    }
    
    console.log('📋 Users found:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}`);
      console.log(`   Email: ${user.email || 'N/A'}`);
      console.log(`   Name: ${user.name || 'N/A'}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

getUserId();