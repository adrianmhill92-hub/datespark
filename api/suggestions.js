import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

/**
 * POST /api/suggestions
 * Body: { profileA, profileB }
 * Returns: { suggestions: [...] }
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { profileA, profileB, budget } = req.body

  if (!profileA || !profileB) {
    return res.status(400).json({ message: 'Both profiles are required' })
  }

  const prompt = buildPrompt(profileA, profileB, budget || 'medium')

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content[0].text
    const suggestions = parseResponse(text)

    return res.status(200).json({ suggestions })
  } catch (err) {
    console.error('Claude API error:', err)
    return res.status(500).json({ message: 'Failed to generate suggestions' })
  }
}

function buildPrompt(a, b, budget = 'medium') {
  return `You are a creative date planner. Two people want to go on a date and you need to suggest the best activities for them based on their profiles.

Person A:
- Name: ${a.name}
- Age: ${a.age ?? 'not specified'}
- City: ${a.city}
- Interests: ${a.interests?.join(', ')}
- Preferred vibes: ${Array.isArray(a.vibes) ? a.vibes.join(', ') : (a.vibes || 'not specified')}
- Notes: ${a.notes || 'none'}

Person B:
- Name: ${b.name}
- Age: ${b.age ?? 'not specified'}
- City: ${b.city}
- Interests: ${b.interests?.join(', ')}
- Preferred vibes: ${Array.isArray(b.vibes) ? b.vibes.join(', ') : (b.vibes || 'not specified')}
- Notes: ${b.notes || 'none'}

Budget for this date: ${budget}

Generate exactly 5 ranked date activity suggestions tailored to both profiles. Find common interests and complementary preferences. Prioritize activities that work in their city.

Respond ONLY with a valid JSON array (no markdown, no extra text) in this format:
[
  {
    "title": "Activity name",
    "description": "2-3 sentence description of the date",
    "budget": "$20–$40 per person",
    "vibe": "Adventurous",
    "duration": "2–3 hours",
    "why": "One sentence on why this suits them both"
  }
]`
}

function parseResponse(text) {
  try {
    // Strip any accidental markdown fences
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    return JSON.parse(cleaned)
  } catch {
    throw new Error('Failed to parse AI response')
  }
}
