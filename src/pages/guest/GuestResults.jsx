import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getGuestSuggestions } from '../../lib/claude'

export default function GuestResults() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const answers = state?.answers ?? (() => {
    try { return JSON.parse(sessionStorage.getItem('guestAnswers') || 'null') } catch { return null }
  })()

  const [suggestions, setSuggestions] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!answers) return
    load()
  }, [])

  async function load() {
    try {
      const ideas = await getGuestSuggestions({
        city: answers.city,
        interests: answers.interests,
        vibe: answers.vibe,
        budget: answers.budget,
        group_size: answers.group_size,
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
        </div>

        {/* Unlocked cards — first 2 */}
        {suggestions.slice(0, 2).map((s, i) => (
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

        {/* Locked card — 3rd idea */}
        {suggestions[2] && (
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-sm p-5 space-y-2 blur-sm select-none" aria-hidden="true">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-gray-800">{suggestions[2].title}</h3>
                <span className="text-xs bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full whitespace-nowrap">{suggestions[2].vibe}</span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">{suggestions[2].description}</p>
              <div className="flex gap-3 text-xs text-gray-400">
                <span>{suggestions[2].budget}</span>
                <span>·</span>
                <span>{suggestions[2].duration}</span>
              </div>
              <p className="text-xs text-rose-500 italic">{suggestions[2].why}</p>
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-white/70 backdrop-blur-sm gap-2">
              <span className="text-2xl">🔒</span>
              <span className="text-sm font-semibold text-gray-700">Unlock this idea</span>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="bg-rose-500 rounded-2xl p-6 text-center space-y-3">
          <p className="text-white font-bold text-lg leading-snug">
            Save your ideas + get your shareable date code
          </p>
          <p className="text-rose-100 text-sm">It's free. Your answers are already saved.</p>
          <button
            onClick={handleUpgrade}
            className="w-full bg-white text-rose-500 font-semibold py-2.5 rounded-xl hover:bg-rose-50 transition-colors"
          >
            Create free account →
          </button>
        </div>
      </div>
    </div>
  )
}
