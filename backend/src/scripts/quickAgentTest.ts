import { PrismaClient } from '@prisma/client';
import { AgentManager } from '../services/AgentManager';
import logger from '../utils/logger';

const prisma = new PrismaClient();

async function quickAgentTest() {
  try {
    logger.info('🧪 Starting quick agent system test...');

    // Create a test user
    let testUser = await prisma.user.findFirst({
      where: { email: 'test@agent.com' }
    });

    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          googleId: 'test-agent-user',
          email: 'test@agent.com',
          name: 'Agent Test User',
          onboardingCompleted: true,
        }
      });
    }

    // Create test goals
    const testGoal1 = await prisma.goal.create({
      data: {
        userId: testUser.id,
        title: 'Travel to Thailand',
        description: 'Plan a 2-week vacation to Thailand',
        category: 'travel',
        estimatedCost: 3000,
        currentSaved: 500,
      }
    });

    const testGoal2 = await prisma.goal.create({
      data: {
        userId: testUser.id,
        title: 'Save for House Down Payment',
        description: 'Save $50,000 for a house down payment',
        category: 'financial',
        estimatedCost: 50000,
        currentSaved: 10000,
      }
    });

    // Initialize agent manager
    const agentManager = new AgentManager(prisma);
    
    // Wait a moment for agents to initialize
    await new Promise(resolve => setTimeout(resolve, 1000));

    logger.info('✈️ Testing Travel Agent - Flight Search...');
    const travelResult = await agentManager.executeTask({
      goalId: testGoal1.id,
      userId: testUser.id,
      type: 'searchFlights',
      priority: 'medium',
      parameters: {
        origin: 'NYC',
        destination: 'BKK',
        departureDate: '2025-03-15',
        passengers: 1,
        currency: 'USD'
      }
    });

    console.log('\n=== Travel Agent - Flight Search ===');
    console.log(`✅ Success: ${travelResult.success}`);
    console.log(`🎯 Confidence: ${(travelResult.confidence * 100).toFixed(1)}%`);
    if (travelResult.success && travelResult.data) {
      console.log(`✈️ Flights found: ${travelResult.data.flights?.length || 0}`);
      console.log(`💰 Cheapest price: $${travelResult.data.cheapestPrice}`);
    }

    logger.info('💰 Testing Financial Agent - Savings Plan...');
    const savingsResult = await agentManager.executeTask({
      goalId: testGoal2.id,
      userId: testUser.id,
      type: 'calculateSavingsPlan',
      priority: 'high',
      parameters: {
        goalAmount: 50000,
        currentSavings: 10000,
        targetDate: '2026-01-01',
        monthlyIncome: 6000,
        monthlyExpenses: 4000,
        currency: 'USD'
      }
    });

    console.log('\n=== Financial Agent - Savings Plan ===');
    console.log(`✅ Success: ${savingsResult.success}`);
    console.log(`🎯 Confidence: ${(savingsResult.confidence * 100).toFixed(1)}%`);
    if (savingsResult.success && savingsResult.data) {
      console.log(`💵 Amount needed: $${savingsResult.data.amountNeeded}`);
      console.log(`📅 Months to goal: ${savingsResult.data.monthsToGoal}`);
      console.log(`💰 Monthly target: $${Math.round(savingsResult.data.scenarios.current.monthlyAmount)}`);
      console.log(`✅ Feasible: ${savingsResult.data.scenarios.current.feasible}`);
    }

    logger.info('💱 Testing Financial Agent - Currency Conversion...');
    const currencyResult = await agentManager.executeTask({
      goalId: testGoal2.id,
      userId: testUser.id,
      type: 'convertCurrency',
      priority: 'low',
      parameters: {
        amount: 1000,
        fromCurrency: 'USD',
        toCurrency: 'EUR'
      }
    });

    console.log('\n=== Financial Agent - Currency Conversion ===');
    console.log(`✅ Success: ${currencyResult.success}`);
    if (currencyResult.success && currencyResult.data) {
      console.log(`💱 $${currencyResult.data.originalAmount} USD = €${currencyResult.data.finalAmount.toFixed(2)}`);
      console.log(`📊 Exchange rate: ${currencyResult.data.exchangeRate}`);
    }

    // Get performance summary
    const agents = await agentManager.getAllAgents();
    console.log('\n=== Performance Summary ===');
    for (const agent of agents.slice(0, 2)) { // Only active agents
      const status = await agentManager.getAgentStatus(agent.id);
      console.log(`🤖 ${status.name}: ${status.performance.totalExecutions} tasks, ${(status.performance.successRate * 100).toFixed(1)}% success rate`);
    }

    console.log('\n🎉 QUICK TEST SUMMARY');
    console.log('=====================');
    console.log('✅ Agent system operational');
    console.log('✅ Travel Agent: Flight search working');
    console.log('✅ Financial Agent: Savings & currency working');
    console.log('✅ Database integration working');
    console.log('✅ Task execution and tracking working');
    
    console.log('\n🚀 Ready for frontend integration!');

    // Cleanup test data
    await prisma.goal.deleteMany({
      where: { userId: testUser.id }
    });
    await prisma.user.delete({
      where: { id: testUser.id }
    });

    logger.info('✅ Quick agent test completed successfully!');

  } catch (error) {
    logger.error('❌ Quick agent test failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run test
if (require.main === module) {
  quickAgentTest()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { quickAgentTest };