// Test Travel Agent Visa function directly
async function testTravelAgentVisa() {
  console.log('🧪 Testing Travel Agent Visa Requirements...');
  
  try {
    const response = await fetch('http://localhost:5000/agents/execute-task', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'connect.sid=test' // This will fail auth but we can see if the endpoint works
      },
      body: JSON.stringify({
        taskType: 'checkVisaRequirements',
        parameters: {
          fromCountry: 'US',
          toCountry: 'JP',
          nationality: 'US',
          purposeOfTravel: 'tourism'
        },
        goalId: 'test-visa-goal'
      })
    });
    
    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testTravelAgentVisa();