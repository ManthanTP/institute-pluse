import { GoogleGenerativeAI } from '@google/generative-ai'

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY

let genAI = null
let model = null

function getModel() {
  if (!API_KEY || API_KEY === 'your_gemini_api_key') {
    return null
  }
  if (!genAI) {
    genAI = new GoogleGenerativeAI(API_KEY)
    // Fallback logic for model availability
    try {
      model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    } catch (e) {
      try {
        model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
      } catch (e2) {
        model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' })
      }
    }
  }
  return model
}


// ── ECO RECOMMENDATIONS ──
export async function getEcoRecommendations(carbonData) {
  const m = getModel()
  if (!m) return getStaticEcoTips(carbonData)

  try {
    const prompt = `You are a campus sustainability advisor for InstitutePulse.
Analyze this student's carbon footprint data and give 3 concise, actionable, specific tips.
Format as a JSON array of strings. Be encouraging and specific.

Carbon data today:
- Transport: ${carbonData.transport_kg?.toFixed(2)} kg CO2
- Electricity: ${carbonData.electricity_kg?.toFixed(2)} kg CO2
- Food: ${carbonData.food_kg?.toFixed(2)} kg CO2
- Water: ${carbonData.water_kg?.toFixed(2)} kg CO2
- Waste: ${carbonData.waste_kg?.toFixed(2)} kg CO2
- Total: ${carbonData.total_kg?.toFixed(2)} kg CO2
- Eco Score: ${carbonData.eco_score}/100

Respond with ONLY a JSON array like: ["tip1", "tip2", "tip3"]`

    const result = await m.generateContent(prompt)
    const text = result.response.text()
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    return getStaticEcoTips(carbonData)
  } catch (err) {
    console.error('Gemini error:', err)
    return getStaticEcoTips(carbonData)
  }
}

function getStaticEcoTips(carbonData) {
  const tips = []
  const { transport_kg, food_kg, electricity_kg } = carbonData

  if (transport_kg > 0.5) {
    tips.push('🚌 Consider taking the college bus tomorrow — it saves ~0.36 kg CO2 compared to a motorbike for a 5km commute!')
  } else {
    tips.push('🚲 Great transport choices today! Keep using eco-friendly modes to earn more eco-points.')
  }

  if (food_kg > 2) {
    tips.push('🥗 Replacing one non-veg meal with vegetarian saves ~1 kg CO2 per day — try it tomorrow!')
  } else {
    tips.push('🌱 Your food choices are eco-friendly! Vegan meals have the lowest carbon footprint.')
  }

  if (electricity_kg > 1) {
    tips.push('💡 Reduce AC usage by 1 hour to save ~1.23 kg CO2. Setting AC to 24°C instead of 20°C cuts electricity CO2 by 30%.')
  } else {
    tips.push('⚡ Excellent energy usage today! Remember to switch off devices when not in use.')
  }

  return tips
}

// ── STUDY PLAN GENERATOR ──
export async function generateStudyPlan({ subjects, daily_hours }) {
  const m = getModel()
  if (!m) return getStaticStudyPlan(subjects, daily_hours)

  try {
    const prompt = `You are an academic study planner. Create a 7-day study schedule.
Subjects: ${JSON.stringify(subjects)}
Daily study hours available: ${daily_hours}

Return ONLY a JSON object like:
{
  "week": [
    {"day": "Monday", "date": "Day 1", "tasks": [{"subject": "Math", "topic": "Calculus", "hours": 2}]},
    ...7 days total
  ]
}`

    const result = await m.generateContent(prompt)
    const text = result.response.text()
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) return JSON.parse(jsonMatch[0])
    return getStaticStudyPlan(subjects, daily_hours)
  } catch (err) {
    console.error('Gemini study plan error:', err)
    return getStaticStudyPlan(subjects, daily_hours)
  }
}

function getStaticStudyPlan(subjects, daily_hours) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const subjectList = subjects?.length ? subjects : ['Mathematics', 'Physics', 'Chemistry']
  const hoursPerSubject = Math.floor((daily_hours || 3) / subjectList.length) || 1

  return {
    week: days.map((day, i) => ({
      day,
      date: `Day ${i + 1}`,
      tasks: subjectList.map((subject, j) => ({
        subject,
        topic: `Chapter ${i + 1} - Core Concepts`,
        hours: hoursPerSubject,
      }))
    }))
  }
}

// ── AI CHATBOT ──
export async function chatWithAssistant(messages) {
  if (!API_KEY || API_KEY === 'your_gemini_api_key') {
    return "Hi! I'm InstitutePulse AI Assistant. I'm currently running in offline mode. Please configure your Gemini API key for full AI capabilities. In the meantime, I can tell you that: Taking the college bus saves ~0.36 kg CO2 per 5km vs motorbike. Vegetarian meals save ~1 kg CO2 vs non-veg. Logging daily earns you eco-points and badges! 🌿"
  }

  if (!genAI) {
    genAI = new GoogleGenerativeAI(API_KEY)
  }

  try {
    const systemPrompt = `You are InstitutePulse — a Smart Campus Sustainability Assistant.
You know about:
- Carbon footprint tracking (transport, food, electricity, water, waste)
- Campus bus routes and eco-benefits of public transport
- Cafeteria menu and low-carbon food choices
- QR attendance and paperless systems
- Eco-points, badges, leaderboards, and green challenges
- Study planning and academic support
- Campus sustainability initiatives

Key facts:
- College bus: 0.048 kg CO2/km (vs motorbike 0.120 kg CO2/km)
- Campus budget: 5 kg CO2/day per student
- Eco score 90-100 = Excellent (Eco Champion)
- Log daily for streak bonuses and badges

Be concise, helpful, eco-aware, and encouraging. Use emojis occasionally.`

    // Correct pattern for system instructions in newer SDK versions
    const chatModel = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      systemInstruction: systemPrompt 
    })

    // Ensure history starts with 'user' role (SDK requirement)
    let history = messages.slice(0, -1).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }))

    const firstUserIndex = history.findIndex(m => m.role === 'user')
    if (firstUserIndex !== -1) {
      history = history.slice(firstUserIndex)
    } else {
      history = [] // No user messages in history yet
    }

    const chat = chatModel.startChat({ history })

    const lastMessage = messages[messages.length - 1]
    const result = await chat.sendMessage(lastMessage.content)
    return result.response.text()
  } catch (err) {
    console.error('Gemini chat error:', err)
    
    const isLeaked = err.message?.toLowerCase().includes('leaked') || 
                     err.toString().toLowerCase().includes('leaked')

    if (isLeaked) {
      return '⚠️ Your Gemini API Key has been reported as LEAKED and disabled by Google. To fix this:\n1. Go to https://aistudio.google.com/apikey\n2. Create a NEW API Key.\n3. Update the VITE_GEMINI_API_KEY in your .env file.\n4. Restart your dev server. 🌿'
    }

    // Handle 503 / High Demand / Other errors with rotation
    const fallbackModels = ['gemini-2.0-flash', 'gemini-flash-latest']
    for (const modelName of fallbackModels) {
      try {
        console.log(`Trying fallback model: ${modelName}`)
        const fallbackModel = genAI.getGenerativeModel({ model: modelName })
        const result = await fallbackModel.generateContent(messages[messages.length - 1].content)
        return result.response.text()
      } catch (fallbackErr) {
        console.error(`Fallback to ${modelName} failed:`, fallbackErr)
      }
    }

    return 'The AI service is currently experiencing high demand. Please try again in a moment. 🌿'
  }
}

// ── LAB ASSISTANT ──
export async function askLabAssistant(subject, question) {
  if (!API_KEY || API_KEY === 'your_gemini_api_key') {
    return `📚 **${subject} Lab Assistant**\n\nI'm in offline mode. Please configure your Gemini API key for full AI lab assistance.\n\nFor your question: "${question}"\n\nI recommend consulting your lab manual and textbook. Remember: digital learning saves paper and earns you eco-points! 🌱`
  }

  if (!genAI) {
    genAI = new GoogleGenerativeAI(API_KEY)
  }

  try {
    const labModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const prompt = `You are a virtual lab assistant for ${subject}.
Help students understand experiments, procedures, and prepare for viva examinations.
Be clear, structured, and educational.

Student question: ${question}

Provide a helpful, structured response.`

    const result = await labModel.generateContent(prompt)
    return result.response.text()
  } catch (err) {
    console.error('Gemini lab assistant error:', err)
    
    const isLeaked = err.message?.toLowerCase().includes('leaked') || 
                     err.toString().toLowerCase().includes('leaked')

    if (isLeaked) {
      return '⚠️ Your Gemini API Key has been reported as LEAKED and disabled by Google. Please generate a new key at https://aistudio.google.com/apikey and update your .env file. 🌿'
    }

    try {
      const fallbackModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
      const result = await fallbackModel.generateContent(question)
      return result.response.text()
    } catch (fallbackErr) {
      return 'I encountered an issue. Please check your AI quota or connection. 🌿'
    }
  }
}
