// Test OpenWeather API from user's code
async function testOpenWeather() {
  const rapidApiKey = '0b9ed22f0fmsh9e564e6e99bd1cdp1a4645jsn71db6381c4b3';
  
  console.log('🧪 Testing OpenWeather API...');
  
  try {
    // Test the OpenWeather API with the user's example (NYC coordinates)
    console.log('\n🌤️ Testing 5-day weather forecast for NYC...');
    
    const weatherUrl = 'https://open-weather13.p.rapidapi.com/fivedaysforcast?latitude=40.730610&longitude=-73.935242&lang=EN';
    
    const response = await fetch(weatherUrl, {
      headers: {
        'x-rapidapi-key': rapidApiKey,
        'x-rapidapi-host': 'open-weather13.p.rapidapi.com'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers));
    
    if (response.ok) {
      const data = await response.json();
      console.log('Response structure:', {
        type: typeof data,
        keys: Object.keys(data || {}),
        hasWeather: !!data.weather,
        hasForecast: !!data.forecast,
        hasList: !!data.list,
        hasDaily: !!data.daily,
        sampleKeys: Object.keys(data || {}).slice(0, 10)
      });
      
      // Try to find actual weather data
      console.log('\n🌡️ Weather data analysis:');
      if (data.list && Array.isArray(data.list)) {
        console.log(`✅ Found ${data.list.length} forecast periods in 'list' array`);
        if (data.list.length > 0) {
          const firstPeriod = data.list[0];
          console.log('First forecast period:', {
            date: firstPeriod.dt_txt || firstPeriod.dt,
            temp: firstPeriod.main?.temp,
            description: firstPeriod.weather?.[0]?.description,
            humidity: firstPeriod.main?.humidity,
            windSpeed: firstPeriod.wind?.speed
          });
        }
      } else if (data.daily && Array.isArray(data.daily)) {
        console.log(`✅ Found ${data.daily.length} daily forecasts in 'daily' array`);
        if (data.daily.length > 0) {
          const firstDay = data.daily[0];
          console.log('First day forecast:', {
            temp: firstDay.temp,
            description: firstDay.weather?.[0]?.description,
            humidity: firstDay.humidity
          });
        }
      } else if (data.weather && Array.isArray(data.weather)) {
        console.log(`✅ Found weather data in 'weather' array`);
        console.log('Weather info:', {
          temp: data.main?.temp,
          description: data.weather[0]?.description,
          humidity: data.main?.humidity,
          windSpeed: data.wind?.speed
        });
      } else {
        console.log('⚠️ No standard weather array found');
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
    
    // Test current weather endpoint too
    console.log('\n🌤️ Testing current weather for NYC...');
    
    const currentWeatherUrl = 'https://open-weather13.p.rapidapi.com/city/latlon/40.730610/-73.935242';
    
    const currentResponse = await fetch(currentWeatherUrl, {
      headers: {
        'x-rapidapi-key': rapidApiKey,
        'x-rapidapi-host': 'open-weather13.p.rapidapi.com'
      }
    });
    
    console.log('Current weather status:', currentResponse.status);
    
    if (currentResponse.ok) {
      const currentData = await currentResponse.json();
      console.log('✅ Current weather working!', {
        temp: currentData.main?.temp,
        description: currentData.weather?.[0]?.description,
        humidity: currentData.main?.humidity,
        city: currentData.name
      });
    } else {
      const currentError = await currentResponse.json().catch(() => ({}));
      console.log('❌ Current weather failed:', currentError);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testOpenWeather();