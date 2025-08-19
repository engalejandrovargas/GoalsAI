// Test script for Smart Goals API
// Using native fetch (Node 18+) or polyfill

const API_BASE = 'http://localhost:5000';

async function testSmartGoalsAPI() {
  console.log('🚀 Testing Smart Goals API...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing health check...');
    const healthResponse = await fetch(`${API_BASE}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.status);
    console.log();

    // Test 2: Get agents (to verify our agents are loaded)
    console.log('2. Testing agents endpoint...');
    const agentsResponse = await fetch(`${API_BASE}/agents`, {
      credentials: 'include',
    });
    if (agentsResponse.ok) {
      const agentsData = await agentsResponse.json();
      console.log(`✅ Found ${agentsData.agents?.length || 0} agents`);
      
      // Check if GoalAnalyzerAgent is present
      const goalAnalyzer = agentsData.agents?.find(agent => agent.type === 'goal_analyzer');
      if (goalAnalyzer) {
        console.log('✅ GoalAnalyzerAgent found:', goalAnalyzer.name);
      } else {
        console.log('⚠️ GoalAnalyzerAgent not found');
      }
    } else {
      console.log('❌ Agents endpoint failed:', agentsResponse.status);
    }
    console.log();

    // Test 3: Test the agent execution (without authentication for testing)
    console.log('3. Testing goal analysis (mock test)...');
    const testTaskResponse = await fetch(`${API_BASE}/test-agents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        taskType: 'analyzeGoalComplexity',
        parameters: {
          goalDescription: 'I want to travel to Japan for 2 weeks in spring 2024',
          userProfile: {
            location: 'New York',
            ageRange: '25-34',
            budget: 5000,
          }
        }
      })
    });

    if (testTaskResponse.ok) {
      const testResult = await testTaskResponse.json();
      console.log('✅ Goal analysis test successful!');
      console.log('Result:', JSON.stringify(testResult, null, 2));
    } else {
      const errorText = await testTaskResponse.text();
      console.log('❌ Goal analysis test failed:', testTaskResponse.status);
      console.log('Error:', errorText);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }

  console.log('\n🎉 Smart Goals API test completed!');
}

// Run the test
testSmartGoalsAPI();