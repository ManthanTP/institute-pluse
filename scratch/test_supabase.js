import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf8');
const urlMatch = env.match(/VITE_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/);
const URL = urlMatch ? urlMatch[1].trim() : null;
const KEY = keyMatch ? keyMatch[1].trim() : null;

async function test() {
  console.log('Testing Supabase Connection...');
  if (!URL || !KEY) return;
  
  const supabase = createClient(URL, KEY);
  try {
    const { data, error } = await supabase.from('profiles').select('count').single();
    if (error) throw error;
    console.log('Supabase Success: Connected to profiles.');
  } catch (err) {
    console.error('Supabase FAILED:', err.message);
  }
}

test();
