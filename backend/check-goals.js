const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkGoals() {
  try {
    const user = await prisma.user.findFirst({ 
      where: { email: 'miedumni@gmail.com' },
      select: {
        id: true,
        email: true,
        firstGoal: true,
        onboardingCompleted: true
      }
    });
    
    console.log('User found:', user ? user.id : 'Not found');
    
    if (user) {
      console.log('Email:', user.email);
      console.log('First Goal:', user.firstGoal);
      console.log('Onboarding Completed:', user.onboardingCompleted);
      
      const goals = await prisma.goal.findMany({ 
        where: { userId: user.id },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          createdAt: true
        }
      });
      
      console.log('Goals count:', goals.length);
      goals.forEach(g => {
        console.log('Goal:', {
          id: g.id,
          title: g.title,
          description: g.description?.substring(0, 50) + '...',
          status: g.status,
          createdAt: g.createdAt
        });
      });
    }
  } catch(e) { 
    console.error('Error:', e); 
  } finally { 
    await prisma.$disconnect(); 
  }
}

checkGoals();