// Using global fetch in Node.js 18+

async function testNewsAPI() {
  const apiKey = '02b5c069577042ae91034f0cfb32000c';
  const url = `https://newsapi.org/v2/everything?q="technology market trends"&sortBy=publishedAt&language=en&pageSize=5&apiKey=${apiKey}`;
  
  console.log('Testing NewsAPI with URL:', url);
  
  try {
    const response = await fetch(url);
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers));
    
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (data.articles && data.articles.length > 0) {
      console.log(`✅ SUCCESS: Found ${data.articles.length} articles`);
      console.log('First article:', data.articles[0].title);
    } else {
      console.log('❌ No articles found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testNewsAPI();