import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dctrlbxftgvfeqbkatgr.supabase.co'
const supabaseAnonKey = 'sb_publishable_1cOD0ZWQDuZfyRuGgniN5A_za40rUgr'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function registerAdmin() {
  const email = 'manthantp01@gmail.com'
  const password = 'admin@12345'
  const fullName = 'Manthan Patel'

  console.log(`Attempting to register ${email}...`)

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      }
    }
  })

  if (error) {
    console.error('Error during registration:', error.message)
    return
  }

  if (data.user) {
    console.log('User registered successfully! ID:', data.user.id)
  } else {
    console.log('Registration initiated. Please check your email for confirmation.')
  }
}

registerAdmin()
