// Test RapidAPI Visa Requirements
async function testVisaAPI() {
  const rapidApiKey = '0b9ed22f0fmsh9e564e6e99bd1cdp1a4645jsn71db6381c4b3';
  
  console.log('🧪 Testing RapidAPI Visa Requirements...');
  
  try {
    // Test 1: Get countries list
    console.log('\n📍 Step 1: Getting countries list...');
    const countriesResponse = await fetch('https://visa-requirements4.p.rapidapi.com/countries', {
      headers: {
        'x-rapidapi-key': rapidApiKey,
        'x-rapidapi-host': 'visa-requirements4.p.rapidapi.com'
      }
    });
    
    console.log('Countries response status:', countriesResponse.status);
    
    if (countriesResponse.ok) {
      const countriesData = await countriesResponse.json();
      console.log('Sample countries:', JSON.stringify(countriesData.slice(0, 5), null, 2));
      console.log(`✅ SUCCESS: Found ${countriesData.length} countries`);
      
      // Test 2: Check visa requirements (example: US citizen to Japan)
      console.log('\n✈️ Step 2: Testing visa requirements (US to Japan)...');
      const visaResponse = await fetch('https://visa-requirements4.p.rapidapi.com/visa-requirements?from=US&to=JP', {
        headers: {
          'x-rapidapi-key': rapidApiKey,
          'x-rapidapi-host': 'visa-requirements4.p.rapidapi.com'
        }
      });
      
      console.log('Visa response status:', visaResponse.status);
      
      if (visaResponse.ok) {
        const visaData = await visaResponse.json();
        console.log('Visa requirements:', JSON.stringify(visaData, null, 2));
        console.log('✅ Visa API working!');
      } else {
        const errorData = await visaResponse.json();
        console.log('Visa error:', errorData);
      }
      
    } else {
      const errorData = await countriesResponse.json();
      console.log('❌ Countries request failed:', errorData);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testVisaAPI();