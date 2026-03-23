import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
})

/**
 * Call the Claude API directly from the browser to get ranked date suggestions.
 *
 * @param {Object} profileA - First user's profile
 * @param {Object} profileB - Second user's profile
 * @returns {Promise<Array>} Ranked array of date activity suggestions
 */
export async function getDateSuggestions(profileA, profileB, timing, events = []) {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    messages: [{ role: 'user', content: buildPrompt(profileA, profileB, timing, events) }],
  })

  return parseResponse(message.content[0].text)
}

function formatTiming(timing) {
  if (!timing?.date) return null
  const { date, startTime, endTime } = timing
  const d = new Date(`${date}T00:00:00`)
  const dayName = d.toLocaleDateString('en-US', { weekday: 'long' })
  const fullDate = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  function fmt12(t) {
    if (!t) return ''
    const [h, m] = t.split(':').map(Number)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const h12 = h % 12 || 12
    return `${h12}:${String(m).padStart(2, '0')} ${ampm}`
  }

  let duration = ''
  if (startTime && endTime) {
    const [sh, sm] = startTime.split(':').map(Number)
    const [eh, em] = endTime.split(':').map(Number)
    const mins = (eh * 60 + em) - (sh * 60 + sm)
    if (mins > 0) {
      const h = Math.floor(mins / 60)
      const m = mins % 60
      duration = h && m ? `${h}h ${m}m` : h ? `${h} hour${h > 1 ? 's' : ''}` : `${m} minutes`
    }
  }

  return `Date & time:
- Date: ${dayName}, ${fullDate}
- Start: ${fmt12(startTime)}
- End: ${fmt12(endTime)}${duration ? `\n- Duration available: ${duration}` : ''}`
}

function formatEvents(events) {
  if (!Array.isArray(events) || events.length === 0) return null
  const lines = events.map((e, i) => {
    const timeStr = e.time ? ` at ${e.time}` : ''
    return `${i + 1}. ${e.name} | ${e.category} | ${e.venue}${timeStr} | ${e.url}`
  })
  return `Real local events happening that day (from Ticketmaster):\n${lines.join('\n')}`
}

function buildPrompt(a, b, timing, events = []) {
  const timingBlock = formatTiming(timing)
  const eventsBlock = formatEvents(events)
  return `You are a creative date planner. Two people want to go on a date and you need to suggest the best activities for them based on their profiles.

Person A:
- Name: ${a.name}
- Age: ${a.age ?? 'not specified'}
- City: ${a.city}${a.zip_code ? `, zip ${a.zip_code}` : ''}
- Willing to travel: ${a.travel_miles === 'any' ? 'any distance' : `up to ${a.travel_miles} miles`}
- Interests: ${a.interests?.join(', ')}
- Preferred vibe: ${a.vibe}
- Notes: ${a.notes || 'none'}

Person B:
- Name: ${b.name}
- Age: ${b.age ?? 'not specified'}
- City: ${b.city}${b.zip_code ? `, zip ${b.zip_code}` : ''}
- Willing to travel: ${b.travel_miles === 'any' ? 'any distance' : `up to ${b.travel_miles} miles`}
- Interests: ${b.interests?.join(', ')}
- Preferred vibe: ${b.vibe}
- Notes: ${b.notes || 'none'}

Budget for this date: ${timing?.budget || 'medium'}
${timingBlock ? `\n${timingBlock}\n` : ''}${eventsBlock ? `\n${eventsBlock}\n` : ''}
Generate exactly 5 ranked date activity suggestions tailored to both profiles. Find common interests and complementary preferences. Suggest only activities reachable within the smaller of the two travel distances. Prioritize activities that work in their city.${timingBlock ? ' Suggest only activities that fit within the available time window and suit the time of day (e.g. brunch spots for morning, dinner and shows for evening, bars and live music for late night).' : ''}${eventsBlock ? ' Incorporate 2-3 of the real local events above if they genuinely suit both people\'s interests and budget — rank them naturally among the 5. For each real event: use its exact name as the title, set "source" to "ticketmaster", and set "url" to its Ticketmaster URL. For all AI-generated suggestions set "source" to "ai" and "url" to null.' : ''}

Respond ONLY with a valid JSON array (no markdown, no extra text) in this format:
[
  {
    "title": "Activity name",
    "description": "2-3 sentence description of the date",
    "budget": "$20–$40 per person",
    "vibe": "Adventurous",
    "duration": "2–3 hours",
    "why": "One sentence on why this suits them both",
    "source": "ai",
    "url": null
  }
]`
}

export async function getPersonalityAnalysis(answers) {
  const lines = Object.entries(answers).map(([k, v]) => `${k}: ${v}`).join('\n')
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 500,
    messages: [{
      role: 'user',
      content: `Based on these 10 answers about someone's dating preferences, assign exactly one badge from this list: "The Adventurer", "The Romantic", "The Foodie", "The Culture Vulture", "The Nester", "The Wildcard". Then write a 2-3 sentence personality summary about their date style.

Answers:
${lines}

Respond ONLY with valid JSON (no markdown): { "badge": "...", "summary": "..." }`,
    }],
  })
  const text = message.content[0].text.trim()
  try { return JSON.parse(text) } catch {
    const m = text.match(/\{[\s\S]*\}/)
    if (m) return JSON.parse(m[0])
    throw new Error('Failed to parse personality response')
  }
}

export async function getGuestSuggestions(profile) {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    messages: [{
      role: 'user',
      content: `You are a creative date planner. Suggest exactly 2 date ideas for this person.

Profile:
- City: ${profile.city}${profile.zip_code ? `, zip ${profile.zip_code}` : ''}
- Interests: ${profile.interests?.join(', ')}
- Vibe: ${profile.vibe}
- Budget: ${profile.budget}
- When: ${profile.when || 'flexible'}

Respond ONLY with a valid JSON array (no markdown):
[{ "title": "...", "description": "2-3 sentences", "budget": "$X–$Y per person", "vibe": "...", "duration": "...", "why": "..." }]`,
    }],
  })
  const t = message.content[0].text.trim()
  try { return JSON.parse(t) } catch {
    const m = t.match(/\[[\s\S]*\]/)
    if (m) return JSON.parse(m[0])
    throw new Error('Failed to parse guest suggestions')
  }
}

export async function getPlannerQuestions(context) {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 800,
    messages: [{
      role: 'user',
      content: `You are helping someone plan a surprise date for their partner. Based on this context, generate exactly 5 natural conversation questions they can ask their date to better understand their preferences. The questions should feel like normal conversation, not a survey.

Context: ${context}

Respond ONLY with a valid JSON array of 5 strings (no markdown): ["question 1", "question 2", ...]`,
    }],
  })
  const t = message.content[0].text.trim()
  try { return JSON.parse(t) } catch {
    const m = t.match(/\[[\s\S]*\]/)
    if (m) return JSON.parse(m[0])
    throw new Error('Failed to parse planner questions')
  }
}

export async function getDatePlan(context, questionsAndAnswers) {
  const qaLines = questionsAndAnswers.map((qa, i) => `Q${i+1}: ${qa.question}\nA${i+1}: ${qa.answer}`).join('\n\n')
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `You are a creative date planner. Based on the context and what the person learned from their date, create a detailed, personalized date plan.

Context: ${context}

What their date revealed:
${qaLines}

Respond ONLY with valid JSON (no markdown):
{
  "title": "Short evocative plan title",
  "intro": "1-2 sentences explaining why this plan suits them",
  "itinerary": [
    { "time": "7:00 PM", "activity": "...", "why": "one sentence" }
  ],
  "bookingTips": ["tip 1", "tip 2"],
  "personalTouch": "One specific personalized detail based on their answers"
}`,
    }],
  })
  const t = message.content[0].text.trim()
  try { return JSON.parse(t) } catch {
    const m = t.match(/\{[\s\S]*\}/)
    if (m) return JSON.parse(m[0])
    throw new Error('Failed to parse date plan')
  }
}

function parseResponse(text) {
  const trimmed = text.trim()

  // Happy path: response is already a bare JSON array
  try {
    return JSON.parse(trimmed)
  } catch {
    // Fallback: extract array from inside markdown fences or surrounding text
    const match = trimmed.match(/\[[\s\S]*?\](?=\s*$)/)
    if (match) {
      try {
        return JSON.parse(match[0])
      } catch (err) {
        throw new Error(`JSON parse failed: ${err.message}. Raw: ${trimmed.slice(0, 300)}`)
      }
    }
    throw new Error(`No JSON array found. Raw: ${trimmed.slice(0, 300)}`)
  }
}
