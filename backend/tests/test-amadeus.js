// Test Amadeus API directly
async function testAmadeus() {
  const amadeusKey = 'IBSXb9Fj6b1t61AaqC5hRbxYb7MnqYkf';
  const amadeusSecret = '35qI58FNzMP3Ge7F';
  
  console.log('🧪 Testing Amadeus API credentials...');
  console.log('Key:', amadeusKey);
  console.log('Secret:', amadeusSecret.substring(0, 8) + '...');
  
  try {
    // Step 1: Get access token
    console.log('\n📡 Step 1: Getting access token...');
    const tokenResponse = await fetch('https://api.amadeus.com/v1/security/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `grant_type=client_credentials&client_id=${amadeusKey}&client_secret=${amadeusSecret}`
    });
    
    console.log('Token response status:', tokenResponse.status);
    console.log('Token response headers:', Object.fromEntries(tokenResponse.headers));
    
    const tokenData = await tokenResponse.json();
    console.log('Token response data:', JSON.stringify(tokenData, null, 2));
    
    if (!tokenResponse.ok) {
      console.log('❌ Token request failed');
      return;
    }
    
    if (!tokenData.access_token) {
      console.log('❌ No access token received');
      return;
    }
    
    console.log('✅ Access token obtained successfully');
    const accessToken = tokenData.access_token;
    
    // Step 2: Test flight search
    console.log('\n✈️ Step 2: Testing flight search...');
    const flightUrl = `https://api.amadeus.com/v2/shopping/flight-offers?originLocationCode=NYC&destinationLocationCode=LAX&departureDate=2025-08-25&adults=1&max=3`;
    console.log('Flight search URL:', flightUrl);
    
    const flightResponse = await fetch(flightUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    console.log('Flight response status:', flightResponse.status);
    console.log('Flight response headers:', Object.fromEntries(flightResponse.headers));
    
    const flightData = await flightResponse.json();
    console.log('Flight response data:', JSON.stringify(flightData, null, 2));
    
    if (flightResponse.ok && flightData.data) {
      console.log(`✅ SUCCESS: Found ${flightData.data.length} flights`);
      if (flightData.data.length > 0) {
        const firstFlight = flightData.data[0];
        console.log('First flight example:');
        console.log('- Price:', firstFlight.price.total, firstFlight.price.currency);
        console.log('- Route:', firstFlight.itineraries[0].segments[0].departure.iataCode, '->', firstFlight.itineraries[0].segments[0].arrival.iataCode);
      }
    } else {
      console.log('❌ Flight search failed');
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

testAmadeus();