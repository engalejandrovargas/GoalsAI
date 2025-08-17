const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createMissingGoal() {
  try {
    const user = await prisma.user.findFirst({ 
      where: { 
        email: 'miedumni@gmail.com',
        onboardingCompleted: true,
        NOT: { firstGoal: null }
      },
      select: {
        id: true,
        email: true,
        firstGoal: true
      }
    });
    
    if (!user || !user.firstGoal) {
      console.log('No user found with firstGoal to create');
      return;
    }
    
    console.log('Found user:', user.email);
    console.log('First Goal:', user.firstGoal);
    
    // Check if goal already exists
    const existingGoals = await prisma.goal.count({ 
      where: { userId: user.id }
    });
    
    if (existingGoals > 0) {
      console.log('User already has goals, skipping creation');
      return;
    }
    
    // Create the goal
    const goal = await prisma.goal.create({
      data: {
        userId: user.id,
        title: user.firstGoal.length > 50 
          ? user.firstGoal.substring(0, 47) + '...' 
          : user.firstGoal,
        description: user.firstGoal,
        category: 'personal',
        status: 'planning',
        priority: 'medium'
      }
    });
    
    console.log('Created goal:', {
      id: goal.id,
      title: goal.title,
      description: goal.description,
      status: goal.status
    });
    
  } catch(e) { 
    console.error('Error:', e); 
  } finally { 
    await prisma.$disconnect(); 
  }
}

createMissingGoal();