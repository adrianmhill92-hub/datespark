import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { generateDateCode } from '../../lib/dateCode'
import { getGuestSuggestions } from '../../lib/claude'

export default function GuestResults() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const answers = state?.answers ?? (() => {
    try { return JSON.parse(sessionStorage.getItem('guestAnswers') || 'null') } catch { return null }
  })()

  const [suggestions, setSuggestions] = useState(null)
  const [guestCode, setGuestCode] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!answers) return
    load()
  }, [])

  async function load() {
    try {
      const code = generateDateCode()
      const { error: dbError } = await supabase.from('profiles').insert({
        date_code: code,
        name: 'Guest',
        city: answers.city,
        zip_code: answers.zip_code || null,
        interests: answers.interests,
        vibe: [answers.vibe],
        budget: answers.budget,
        is_guest: true,
        travel_miles: '25',
      })
      if (dbError) throw new Error(dbError.message)
      setGuestCode(code)

      const ideas = await getGuestSuggestions({
        city: answers.city,
        zip_code: answers.zip_code,
        interests: answers.interests,
        vibe: answers.vibe,
        budget: answers.budget,
        when: answers.when,
      })
      setSuggestions(ideas)
    } catch (err) {
      setError(err.message)
    }
  }

  function handleUpgrade() {
    sessionStorage.setItem('guestAnswers', JSON.stringify(answers))
    navigate('/onboard')
  }

  if (!answers) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center max-w-sm">
          <p className="text-red-500 mb-4">Session expired.</p>
          <button onClick={() => navigate('/guest')} className="text-rose-500 underline text-sm">Start over</button>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center max-w-sm">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={load} className="text-rose-500 underline text-sm">Try again</button>
        </div>
      </div>
    )
  }

  if (!suggestions) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-4 border-rose-200 border-t-rose-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Finding date ideas…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 p-4">
      <div className="max-w-sm mx-auto space-y-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Your date ideas ✨</h1>
          {guestCode && (
            <p className="text-xs text-gray-400 mt-1">Guest code: <span className="font-mono font-bold text-rose-500">{guestCode.toUpperCase()}</span></p>
          )}
        </div>

        {suggestions.map((s, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm p-5 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-gray-800">{s.title}</h3>
              <span className="text-xs bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full whitespace-nowrap">{s.vibe}</span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">{s.description}</p>
            <div className="flex gap-3 text-xs text-gray-400">
              <span>{s.budget}</span>
              <span>·</span>
              <span>{s.duration}</span>
            </div>
            <p className="text-xs text-rose-500 italic">{s.why}</p>
          </div>
        ))}

        {/* Upgrade banner */}
        <div className="bg-gray-900 rounded-2xl p-5 text-center space-y-3">
          <p className="text-yellow-400 text-xs font-bold tracking-widest uppercase">Want more?</p>
          <p className="text-white font-bold">Get 5 ideas + a date personality badge</p>
          <p className="text-gray-400 text-sm">Create a free account — your answers are already saved.</p>
          <button
            onClick={handleUpgrade}
            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-2.5 rounded-xl transition-colors"
          >
            Build my full profile →
          </button>
        </div>
      </div>
    </div>
  )
}
