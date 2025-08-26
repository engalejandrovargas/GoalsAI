const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function listGoals() {
  try {
    const goals = await prisma.goal.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('📋 Available Goals:');
    console.log('==================');

    if (goals.length === 0) {
      console.log('No goals found.');
      return;
    }

    goals.forEach((goal, index) => {
      console.log(`${index + 1}. "${goal.title}"`);
      console.log(`   ID: ${goal.id}`);
      console.log(`   Category: ${goal.category}`);
      console.log(`   Status: ${goal.status}`);
      console.log(`   URL: http://localhost:5173/goal/${goal.id}`);
      console.log('');
    });

    console.log(`🎉 Found ${goals.length} goals total`);

  } catch (error) {
    console.error('❌ Error listing goals:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listGoals();