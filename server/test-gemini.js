require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.log('No GEMINI_API_KEY found in .env');
      return;
    }
    
    console.log('Testing with API key:', apiKey.substring(0, 10) + '...');
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const result = await model.generateContent("Chào bạn, bạn có thể nói 'Test thành công!' được không?");
    const response = await result.response;
    const text = response.text();
    
    console.log('\n--- SUCCESS ---');
    console.log('Model is working correctly!');
    console.log('Response:', text);
  } catch (error) {
    console.log('\n--- FAILED ---');
    console.error('API Error:', error.message);
  }
}

testGemini();
