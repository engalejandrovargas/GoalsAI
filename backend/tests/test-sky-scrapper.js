// Test Sky Scrapper API for flights
async function testSkyScrapper() {
  const rapidApiKey = '0b9ed22f0fmsh9e564e6e99bd1cdp1a4645jsn71db6381c4b3';
  
  console.log('🧪 Testing Sky Scrapper API...');
  
  try {
    // Test the Sky Scrapper API with the user's example
    console.log('\n✈️ Testing Sky Scrapper flight search...');
    
    const skyUrl = 'https://sky-scrapper.p.rapidapi.com/api/v1/flights/getFlightDetails?legs=%5B%7B%22destination%22%3A%22LOND%22%2C%22origin%22%3A%22LAXA%22%2C%22date%22%3A%222024-04-11%22%7D%5D&adults=1&currency=USD&locale=en-US&market=en-US&cabinClass=economy&countryCode=US';
    
    const response = await fetch(skyUrl, {
      headers: {
        'x-rapidapi-key': rapidApiKey,
        'x-rapidapi-host': 'sky-scrapper.p.rapidapi.com'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers));
    
    if (response.ok) {
      const data = await response.json();
      console.log('Response structure:', {
        type: typeof data,
        keys: Object.keys(data || {}),
        hasData: !!data.data,
        hasItineraries: !!data.itineraries,
        hasFlights: !!data.flights,
        sampleKeys: Object.keys(data || {}).slice(0, 10)
      });
      
      // Try to find actual flight data
      console.log('\n📊 Flight data analysis:');
      if (data.data && Array.isArray(data.data)) {
        console.log(`✅ Found ${data.data.length} flight results in 'data' array`);
        if (data.data.length > 0) {
          console.log('First flight sample:', JSON.stringify(data.data[0], null, 2).substring(0, 1000));
        }
      } else if (data.itineraries && Array.isArray(data.itineraries)) {
        console.log(`✅ Found ${data.itineraries.length} flight results in 'itineraries' array`);
        if (data.itineraries.length > 0) {
          console.log('First itinerary sample:', JSON.stringify(data.itineraries[0], null, 2).substring(0, 1000));
        }
      } else {
        console.log('⚠️ No standard flight array found');
        console.log('Full response sample:', JSON.stringify(data, null, 2).substring(0, 1000));
      }
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.log('❌ Request failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSkyScrapper();