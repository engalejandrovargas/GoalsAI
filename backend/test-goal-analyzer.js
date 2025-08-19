// Direct test for GoalAnalyzerAgent
const { GoalAnalyzerAgent } = require('./src/agents/GoalAnalyzerAgent.ts');

async function testGoalAnalyzer() {
  console.log('🧠 Testing GoalAnalyzerAgent directly...\n');

  try {
    // Create the agent instance
    const agent = new GoalAnalyzerAgent({
      id: 'test-agent',
      name: 'Test Goal Analyzer Agent',
      type: 'goal_analyzer',
      description: 'Test agent',
      capabilities: [],
      isActive: true,
      version: '1.0.0'
    });

    console.log('✅ Agent created successfully');
    console.log('Agent name:', agent.getName());
    console.log('Agent type:', agent.getType());
    console.log('Agent capabilities:', JSON.stringify(agent.getCapabilities(), null, 2));

    // Test analyzeGoalComplexity
    console.log('\n2. Testing analyzeGoalComplexity...');
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

    const result = await agent.executeTask(taskParams);
    console.log('✅ Goal complexity analysis result:');
    console.log(JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

// Run the test
testGoalAnalyzer();