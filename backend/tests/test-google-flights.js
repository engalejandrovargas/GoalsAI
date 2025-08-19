// Test Google Flights API from user's code
async function testGoogleFlights() {
  const rapidApiKey = '0b9ed22f0fmsh9e564e6e99bd1cdp1a4645jsn71db6381c4b3';
  
  console.log('🧪 Testing Google Flights API...');
  
  try {
    // Test the Google Flights API with the user's example
    console.log('\n✈️ Testing Google Flights search (LAX to JFK)...');
    
    const googleFlightsUrl = 'https://google-flights2.p.rapidapi.com/api/v1/searchFlights?departure_id=LAX&arrival_id=JFK&travel_class=ECONOMY&adults=1&show_hidden=1&currency=USD&language_code=en-US&country_code=US&search_type=best';
    
    const response = await fetch(googleFlightsUrl, {
      headers: {
        'x-rapidapi-key': rapidApiKey,
        'x-rapidapi-host': 'google-flights2.p.rapidapi.com'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers));
    
    if (response.ok) {
      const data = await response.json();
      console.log('Response structure:', {
        type: typeof data,
        keys: Object.keys(data || {}),
        hasFlights: !!data.flights,
        hasResults: !!data.results,
        hasData: !!data.data,
        sampleKeys: Object.keys(data || {}).slice(0, 10)
      });
      
      // Try to find actual flight data
      console.log('\n📊 Flight data analysis:');
      if (data.flights && Array.isArray(data.flights)) {
        console.log(`✅ Found ${data.flights.length} flights in 'flights' array`);
        if (data.flights.length > 0) {
          console.log('First flight sample:', JSON.stringify(data.flights[0], null, 2).substring(0, 800));
        }
      } else if (data.results && Array.isArray(data.results)) {
        console.log(`✅ Found ${data.results.length} flights in 'results' array`);
        if (data.results.length > 0) {
          console.log('First result sample:', JSON.stringify(data.results[0], null, 2).substring(0, 800));
        }
      } else if (data.data && Array.isArray(data.data)) {
        console.log(`✅ Found ${data.data.length} flights in 'data' array`);
        if (data.data.length > 0) {
          console.log('First data sample:', JSON.stringify(data.data[0], null, 2).substring(0, 800));
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
  
  // Also test visa API with correct host (without 's')
  console.log('\n🧪 Testing visa API with correct host (visa-requirement.p.rapidapi.com)...');
  
  try {
    const visaUrl = 'https://visa-requirement.p.rapidapi.com/map';
    
    console.log('\n📍 Testing visa API map endpoint...');
    
    const visaResponse = await fetch(visaUrl, {
      method: 'POST',
      headers: {
        'x-rapidapi-key': rapidApiKey,
        'x-rapidapi-host': 'visa-requirement.p.rapidapi.com',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    console.log('Visa response status:', visaResponse.status);
    console.log('Visa response headers:', Object.fromEntries(visaResponse.headers));
    
    if (visaResponse.ok) {
      const visaData = await visaResponse.json();
      console.log('✅ Visa API working!', {
        type: typeof visaData,
        keys: Object.keys(visaData || {}),
        sample: JSON.stringify(visaData, null, 2).substring(0, 500)
      });
    } else {
      const visaError = await visaResponse.json().catch(() => ({}));
      console.log('❌ Visa API failed:', visaError);
    }
  } catch (error) {
    console.log(`❌ Visa API test failed: ${error.message}`);
  }
}

testGoogleFlights();