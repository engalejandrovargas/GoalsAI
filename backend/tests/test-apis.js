const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testHealthCheck() {
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return false;
  }
}

async function testCurrencyConversion() {
  try {
    console.log('\n=== Testing Currency Conversion API ===');
    
    // Create a test agent session - skip auth for now by directly calling the financial agent
    const testData = {
      taskType: 'convertCurrency',
      parameters: {
        amount: 100,
        fromCurrency: 'USD',
        toCurrency: 'EUR'
      }
    };
    
    console.log('Request data:', JSON.stringify(testData, null, 2));
    
    // Try without auth first to see if route exists
    const response = await axios.post(`${BASE_URL}/agents/execute-task`, testData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Currency conversion response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Currency conversion failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    return null;
  }
}

async function testMarketResearch() {
  try {
    console.log('\n=== Testing Market Research API ===');
    
    const testData = {
      taskType: 'conductMarketResearch',
      parameters: {
        industry: 'technology',
        region: 'global',
        timeframe: '1year'
      }
    };
    
    console.log('Request data:', JSON.stringify(testData, null, 2));
    
    const response = await axios.post(`${BASE_URL}/agents/execute-task`, testData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Market research response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Market research failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    return null;
  }
}

async function testSavingsPlan() {
  try {
    console.log('\n=== Testing Savings Plan API ===');
    
    const testData = {
      taskType: 'calculateSavingsPlan',
      parameters: {
        goalAmount: 10000,
        currentSavings: 2000,
        targetDate: '2024-12-31',
        monthlyIncome: 5000,
        monthlyExpenses: 3000,
        currency: 'USD'
      }
    };
    
    console.log('Request data:', JSON.stringify(testData, null, 2));
    
    const response = await axios.post(`${BASE_URL}/agents/execute-task`, testData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Savings plan response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Savings plan failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    return null;
  }
}

async function runTests() {
  console.log('🧪 Starting API tests...\n');
  
  // Test health check first
  const healthOk = await testHealthCheck();
  if (!healthOk) {
    console.log('❌ Server not responding, stopping tests');
    return;
  }
  
  // Wait a moment for server to fully start
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test the APIs
  const currencyResult = await testCurrencyConversion();
  const researchResult = await testMarketResearch();
  const savingsResult = await testSavingsPlan();
  
  console.log('\n=== Test Summary ===');
  console.log('Currency Conversion:', currencyResult ? '✅ PASS' : '❌ FAIL');
  console.log('Market Research:', researchResult ? '✅ PASS' : '❌ FAIL');
  console.log('Savings Plan:', savingsResult ? '✅ PASS' : '❌ FAIL');
  
  return {
    currencyConversion: currencyResult,
    marketResearch: researchResult,
    savingsPlan: savingsResult
  };
}

// Run tests if called directly
if (require.main === module) {
  runTests().then(() => process.exit(0)).catch(error => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = { runTests, testCurrencyConversion, testMarketResearch, testSavingsPlan };