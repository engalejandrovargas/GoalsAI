const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateOnboardingGoals() {
  try {
    console.log('🔍 Looking for users who completed onboarding but have no goals...');
    
    // Find users who completed onboarding, have a firstGoal, but no Goal objects
    const usersWithMissingGoals = await prisma.user.findMany({
      where: {
        onboardingCompleted: true,
        NOT: { firstGoal: null },
        firstGoal: { not: '' }
      },
      select: {
        id: true,
        email: true,
        firstGoal: true,
        _count: {
          select: { goals: true }
        }
      }
    });
    
    const usersNeedingGoals = usersWithMissingGoals.filter(user => user._count.goals === 0);
    
    console.log(`📊 Found ${usersNeedingGoals.length} users needing goal creation`);
    
    if (usersNeedingGoals.length === 0) {
      console.log('✅ All users already have their onboarding goals created!');
      return;
    }
    
    // Create goals for these users
    for (const user of usersNeedingGoals) {
      try {
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
        
        console.log(`✅ Created goal for ${user.email}: "${goal.title}"`);
      } catch (error) {
        console.error(`❌ Failed to create goal for ${user.email}:`, error.message);
      }
    }
    
    console.log('🎉 Migration completed!');
    
  } catch(e) { 
    console.error('❌ Migration failed:', e); 
  } finally { 
    await prisma.$disconnect(); 
  }
}

migrateOnboardingGoals();