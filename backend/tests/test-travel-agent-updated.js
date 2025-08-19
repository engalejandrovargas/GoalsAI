// Test Travel Agent with integrated Kiwi.com API
// Using built-in fetch (Node.js 18+)

async function testTravelAgent() {
  console.log('🧪 Testing updated TravelAgent with Kiwi.com API...');
  
  try {
    // Test travel planning endpoint with flight search
    const travelRequest = {
      destination: "Paris",
      startDate: "2024-09-15",
      endDate: "2024-09-20",
      budget: 3000,
      interests: ["culture", "museums"],
      travelStyle: "moderate"
    };
    
    console.log('\n✈️ Testing travel planning with flight search...');
    console.log('Request:', JSON.stringify(travelRequest, null, 2));
    
    const response = await fetch('http://localhost:5000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Plan a travel itinerary from New York to ${travelRequest.destination} from ${travelRequest.startDate} to ${travelRequest.endDate} with a budget of $${travelRequest.budget}. Include flight options.`,
        agentType: 'travel'
      })
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers));
    
    if (response.ok) {
      const data = await response.json();
      console.log('\n📊 Travel Agent Response Analysis:');
      console.log('Response structure:', {
        hasResponse: !!data.response,
        responseLength: data.response ? data.response.length : 0,
        hasItinerary: data.response ? data.response.includes('itinerary') : false,
        hasFlights: data.response ? data.response.includes('flight') : false,
        hasKiwiAPI: data.response ? data.response.includes('Kiwi.com') : false,
        hasDataSource: data.response ? data.response.includes('dataSource') : false
      });
      
      // Look for flight data in response
      if (data.response) {
        const flightMatches = data.response.match(/flight.*?\$\d+/gi) || [];
        const apiMatches = data.response.match(/Kiwi\.com|Amadeus|mock data/gi) || [];
        
        console.log('\n✈️ Flight Data Found:');
        console.log('Flight prices mentioned:', flightMatches.slice(0, 3));
        console.log('API sources mentioned:', apiMatches);
        
        // Extract any JSON-like flight data
        const jsonMatches = data.response.match(/\{[^}]*"dataSource"[^}]*\}/g);
        if (jsonMatches) {
          console.log('\n📝 Data Source Information:');
          jsonMatches.forEach((match, i) => {
            try {
              const parsed = JSON.parse(match);
              console.log(`Source ${i + 1}:`, parsed.dataSource);
            } catch (e) {
              console.log(`Source ${i + 1}:`, match.substring(0, 100));
            }
          });
        }
        
        console.log('\n📄 Sample Response (first 500 chars):');
        console.log(data.response.substring(0, 500));
        console.log('...\n');
        
        // Check if it mentions real API data vs mock data
        if (data.response.includes('Kiwi.com API')) {
          console.log('✅ SUCCESS: TravelAgent is using Kiwi.com API for real flight data!');
        } else if (data.response.includes('Enhanced mock data')) {
          console.log('⚠️ FALLBACK: TravelAgent using mock data (APIs not working)');
        } else {
          console.log('❓ UNCLEAR: Could not determine data source');
        }
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

testTravelAgent();