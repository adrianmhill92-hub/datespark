import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

/**
 * POST /api/suggestions
 * Body: { profileA, profileB, timing, events }
 * Returns: { suggestions: [...] }
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { profileA, profileB, timing, events } = req.body

  if (!profileA || !profileB) {
    return res.status(400).json({ message: 'Both profiles are required' })
  }

  const prompt = buildPrompt(profileA, profileB, timing, events || [])

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    })

    const suggestions = parseResponse(message.content[0].text)
    return res.status(200).json({ suggestions })
  } catch (err) {
    console.error('Claude API error:', err)
    return res.status(500).json({ message: 'Failed to generate suggestions' })
  }
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
  const budget = timing?.budget || 'medium'

  return `You are a creative date planner. Two people want to go on a date and you need to suggest the best activities for them based on their profiles.

Person A:
- Name: ${a.name}
- Age: ${a.age ?? 'not specified'}
- City: ${a.city}${a.zip_code ? `, zip ${a.zip_code}` : ''}
- Willing to travel: ${a.travel_miles === 'any' ? 'any distance' : `up to ${a.travel_miles} miles`}
- Interests: ${a.interests?.join(', ')}
- Preferred vibes: ${Array.isArray(a.vibes) ? a.vibes.join(', ') : (a.vibes || 'not specified')}
- Notes: ${a.notes || 'none'}

Person B:
- Name: ${b.name}
- Age: ${b.age ?? 'not specified'}
- City: ${b.city}${b.zip_code ? `, zip ${b.zip_code}` : ''}
- Willing to travel: ${b.travel_miles === 'any' ? 'any distance' : `up to ${b.travel_miles} miles`}
- Interests: ${b.interests?.join(', ')}
- Preferred vibes: ${Array.isArray(b.vibes) ? b.vibes.join(', ') : (b.vibes || 'not specified')}
- Notes: ${b.notes || 'none'}

Budget for this date: ${budget}
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

function parseResponse(text) {
  const trimmed = text.trim()
  try {
    return JSON.parse(trimmed)
  } catch {
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
