// Test AgentManager directly
const { PrismaClient } = require('@prisma/client');

async function testAgentManager() {
  console.log('🔧 Testing AgentManager...\n');

  const prisma = new PrismaClient();

  try {
    // Import AgentManager
    const { AgentManager } = await import('./src/services/AgentManager.ts');
    
    console.log('1. Creating AgentManager instance...');
    const agentManager = new AgentManager(prisma);
    
    // Wait a bit for agents to initialize
    console.log('2. Waiting for agents to initialize...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test task execution
    console.log('3. Testing task execution...');
    const taskParams = {
      goalId: 'test-goal',
      userId: 'test-user',
      type: 'analyzeGoalComplexity',
      priority: 'high',
      parameters: {
        goalDescription: 'I want to travel to Japan for 2 weeks in spring 2024',
        userProfile: {
          location: 'New York',
          ageRange: '25-34',
          budget: 5000,
        }
      }
    };

    const result = await agentManager.executeTask(taskParams);
    console.log('✅ Task execution result:');
    console.log(JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testAgentManager();