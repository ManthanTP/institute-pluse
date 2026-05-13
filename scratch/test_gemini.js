import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf8');
const keyMatch = env.match(/VITE_GEMINI_API_KEY=(.*)/);
const API_KEY = keyMatch ? keyMatch[1].trim() : null;

async function test() {
  console.log('Listing models...');
  if (!API_KEY) return;
  
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
    const data = await response.json();
    console.log('Models available:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('FAILED to list models:', err.message);
  }
}

test();
