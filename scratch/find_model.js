import fs from 'fs';

const env = fs.readFileSync('.env', 'utf8');
const keyMatch = env.match(/VITE_GEMINI_API_KEY=(.*)/);
const API_KEY = keyMatch ? keyMatch[1].trim() : null;

async function test() {
  if (!API_KEY) return;
  
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
    const data = await response.json();
    if (data.error) {
      console.error('API Error:', data.error.message);
      return;
    }
    
    const flashModels = data.models.filter(m => 
      m.name.toLowerCase().includes('flash') && 
      m.supportedGenerationMethods.includes('generateContent')
    );
    
    console.log('Flash models found:', flashModels.map(m => m.name));
    
    const bestModel = flashModels[0]?.name.replace('models/', '');
    console.log('Recommendation:', bestModel);
  } catch (err) {
    console.error('FAILED:', err.message);
  }
}

test();
