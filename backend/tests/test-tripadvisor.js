// Test TripAdvisor API
async function testTripAdvisor() {
  const apiKey = 'E102E451B1FE42D88A3BDBA067662962';
  
  console.log('🧪 Testing TripAdvisor API...');
  
  try {
    // Test location search
    console.log('\n📍 Step 1: Testing location search...');
    const locationUrl = `https://api.content.tripadvisor.com/api/v1/location/search?key=${apiKey}&searchQuery=Tokyo&language=en`;
    console.log('URL:', locationUrl);
    
    const locationResponse = await fetch(locationUrl);
    console.log('Status:', locationResponse.status);
    
    const locationData = await locationResponse.json();
    console.log('Response:', JSON.stringify(locationData, null, 2));
    
    if (locationResponse.ok && locationData.data) {
      console.log(`✅ SUCCESS: Found ${locationData.data.length} locations`);
    } else {
      console.log('❌ Location search failed');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testTripAdvisor();