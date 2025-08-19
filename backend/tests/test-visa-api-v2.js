// Test visa requirements API - try different endpoints
async function testVisaAPIv2() {
  const rapidApiKey = '0b9ed22f0fmsh9e564e6e99bd1cdp1a4645jsn71db6381c4b3';
  
  console.log('🧪 Testing Visa Requirements API v2...');
  
  // Try different possible endpoints
  const endpoints = [
    'https://visa-requirements.p.rapidapi.com/countries',
    'https://visa-requirements.p.rapidapi.com/api/countries',
    'https://visa-requirements.p.rapidapi.com/v1/countries',
    'https://visa-requirements.p.rapidapi.com/countries/list'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\n📍 Testing endpoint: ${endpoint}`);
      
      const response = await fetch(endpoint, {
        headers: {
          'x-rapidapi-key': rapidApiKey,
          'x-rapidapi-host': 'visa-requirements.p.rapidapi.com'
        }
      });
      
      console.log(`Response status: ${response.status}`);
      console.log(`Response headers:`, Object.fromEntries(response.headers));
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ SUCCESS! Countries response:', {
          type: typeof data,
          length: Array.isArray(data) ? data.length : 'Not array',
          sample: Array.isArray(data) ? data.slice(0, 3) : data
        });
        
        // If successful, try visa requirements
        if (Array.isArray(data) && data.length > 0) {
          console.log('\n🔍 Testing visa requirements...');
          
          const visaUrl = endpoint.replace('/countries', '') + '/visa-requirements?from=US&to=FR';
          const visaResponse = await fetch(visaUrl, {
            headers: {
              'x-rapidapi-key': rapidApiKey,
              'x-rapidapi-host': 'visa-requirements.p.rapidapi.com'
            }
          });
          
          console.log(`Visa response status: ${visaResponse.status}`);
          if (visaResponse.ok) {
            const visaData = await visaResponse.json();
            console.log('✅ Visa requirements working:', visaData);
          } else {
            const visaError = await visaResponse.json().catch(() => ({}));
            console.log('❌ Visa requirements failed:', visaError);
          }
        }
        
        break; // Exit loop if we found a working endpoint
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.log(`❌ Failed: ${response.status} - ${response.statusText}`);
        console.log('Error details:', errorData);
      }
    } catch (error) {
      console.log(`❌ Request failed: ${error.message}`);
    }
  }
  
  // Also test direct visa check without countries list
  console.log('\n🔍 Testing direct visa requirements (US to France)...');
  try {
    const directVisaUrl = 'https://visa-requirements.p.rapidapi.com/visa-requirements?from=US&to=FR';
    const directResponse = await fetch(directVisaUrl, {
      headers: {
        'x-rapidapi-key': rapidApiKey,
        'x-rapidapi-host': 'visa-requirements.p.rapidapi.com'
      }
    });
    
    console.log(`Direct visa response status: ${directResponse.status}`);
    if (directResponse.ok) {
      const directData = await directResponse.json();
      console.log('✅ Direct visa check working:', directData);
    } else {
      const directError = await directResponse.json().catch(() => ({}));
      console.log('❌ Direct visa check failed:', directError);
    }
  } catch (error) {
    console.log(`❌ Direct visa check failed: ${error.message}`);
  }
}

testVisaAPIv2();