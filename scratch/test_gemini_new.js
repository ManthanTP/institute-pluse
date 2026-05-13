import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf8');
const keyMatch = env.match(/VITE_GEMINI_API_KEY=(.*)/);
const API_KEY = keyMatch ? keyMatch[1].trim() : null;

async function test() {
  console.log('Testing Gemini API Key with gemini-2.5-flash (2026 Compatible)...');
  if (!API_KEY) return;
  
  const genAI = new GoogleGenerativeAI(API_KEY);
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent('Hello');
    console.log('Success (gemini-2.5-flash):', result.response.text());
  } catch (err) {
    console.error('FAILED:', err.message);
  }
}

test();
