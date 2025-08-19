// Test Kiwi.com Flights API
async function testKiwiFlights() {
  const rapidApiKey = '0b9ed22f0fmsh9e564e6e99bd1cdp1a4645jsn71db6381c4b3';
  
  console.log('🧪 Testing Kiwi.com Flights API...');
  
  try {
    // Test a simple flight search: NYC to LAX
    console.log('\n✈️ Searching flights NYC to LAX...');
    
    const flightUrl = 'https://kiwi-com-cheap-flights.p.rapidapi.com/round-trip?source=City%3Anewyork_ny_us&destination=City%3Alos-angeles_ca_us&currency=usd&locale=en&adults=1&children=0&infants=0&limit=5';
    
    console.log('URL:', flightUrl);
    
    const response = await fetch(flightUrl, {
      headers: {
        'x-rapidapi-key': rapidApiKey,
        'x-rapidapi-host': 'kiwi-com-cheap-flights.p.rapidapi.com'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers));
    
    if (response.ok) {
      const data = await response.json();
      console.log('Sample response structure:', {
        totalResults: data.length || 'N/A',
        firstResult: data[0] ? {
          price: data[0].price,
          airlines: data[0].airlines,
          duration: data[0].duration,
          routes: data[0].routes?.length
        } : 'No results'
      });
      
      if (data.length > 0) {
        console.log('✅ SUCCESS: Kiwi.com flights API working!');
        console.log('First flight example:', JSON.stringify(data[0], null, 2));
      } else {
        console.log('⚠️ API working but no flights found');
      }
    } else {
      const errorData = await response.json();
      console.log('❌ Flight search failed:', errorData);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testKiwiFlights();