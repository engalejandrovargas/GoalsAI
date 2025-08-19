// Test Kiwi.com Flights API with proper parameters
async function testKiwiFlightsV2() {
  const rapidApiKey = '0b9ed22f0fmsh9e564e6e99bd1cdp1a4645jsn71db6381c4b3';
  
  console.log('🧪 Testing Kiwi.com Flights API v2...');
  
  try {
    // Test 1: Try the exact format from your example
    console.log('\n✈️ Test 1: Using exact format from your example...');
    
    const exactUrl = 'https://kiwi-com-cheap-flights.p.rapidapi.com/round-trip?source=Country%3AGB&destination=City%3Adubrovnik_hr&currency=usd&locale=en&adults=1&children=0&infants=0&limit=5';
    
    const response1 = await fetch(exactUrl, {
      headers: {
        'x-rapidapi-key': rapidApiKey,
        'x-rapidapi-host': 'kiwi-com-cheap-flights.p.rapidapi.com'
      }
    });
    
    console.log('Response status:', response1.status);
    
    if (response1.ok) {
      const data1 = await response1.json();
      console.log('Response type:', typeof data1);
      console.log('Response length:', Array.isArray(data1) ? data1.length : 'Not array');
      console.log('Sample response:', JSON.stringify(data1).substring(0, 500));
      
      if (Array.isArray(data1) && data1.length > 0) {
        console.log('✅ SUCCESS: Found flights!');
      } else {
        console.log('⚠️ No flights in response');
      }
    } else {
      const errorData1 = await response1.json();
      console.log('❌ Request failed:', errorData1);
    }

    // Test 2: Try one-way endpoint
    console.log('\n✈️ Test 2: Trying one-way endpoint...');
    
    const oneWayUrl = 'https://kiwi-com-cheap-flights.p.rapidapi.com/one-way?source=City%3Anewyork_ny_us&destination=City%3Alos-angeles_ca_us&currency=usd&locale=en&adults=1&limit=3';
    
    const response2 = await fetch(oneWayUrl, {
      headers: {
        'x-rapidapi-key': rapidApiKey,
        'x-rapidapi-host': 'kiwi-com-cheap-flights.p.rapidapi.com'
      }
    });
    
    console.log('One-way response status:', response2.status);
    
    if (response2.ok) {
      const data2 = await response2.json();
      console.log('One-way response type:', typeof data2);
      console.log('One-way sample:', JSON.stringify(data2).substring(0, 500));
      
      if (Array.isArray(data2) && data2.length > 0) {
        console.log('✅ SUCCESS: One-way flights found!');
        console.log('First flight price:', data2[0].price);
      }
    } else {
      const errorData2 = await response2.json();
      console.log('❌ One-way failed:', errorData2);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testKiwiFlightsV2();