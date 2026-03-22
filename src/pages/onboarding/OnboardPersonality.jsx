import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { getPersonalityAnalysis } from '../../lib/claude'
import PersonalityBadge from '../../components/PersonalityBadge'

export default function OnboardPersonality() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const { profileId, dateCode, answers } = state || {}

  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!profileId || !answers) return
    analyze()
  }, [])

  async function analyze() {
    try {
      const data = await getPersonalityAnalysis(answers)
      await supabase.from('profiles').update({
        personality_badge: data.badge,
        personality_summary: data.summary,
      }).eq('id', profileId)
      setResult(data)
    } catch (err) {
      setError(err.message)
    }
  }

  const [copied, setCopied] = useState(false)
  function copyCode() {
    navigator.clipboard.writeText(dateCode?.toUpperCase() ?? '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!profileId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center max-w-sm">
          <p className="text-red-500 mb-4">Session expired. Please start over.</p>
          <button onClick={() => navigate('/onboard')} className="text-rose-500 underline text-sm">Start over</button>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center max-w-sm">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={analyze} className="text-rose-500 underline text-sm">Try again</button>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-4 border-rose-200 border-t-rose-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Analyzing your date personality…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-8 space-y-6">
        <div className="text-center">
          <p className="text-xs font-semibold text-rose-400 tracking-widest uppercase mb-1">Step 12 of 12</p>
          <h1 className="text-2xl font-bold text-gray-800">Your date personality</h1>
        </div>

        <PersonalityBadge badge={result.badge} summary={result.summary} />

        <div className="text-center space-y-2">
          <p className="text-sm text-gray-500">Your date code</p>
          <div className="bg-rose-50 border-2 border-rose-200 rounded-xl px-4 py-3">
            <span className="text-3xl font-mono font-bold tracking-[0.25em] text-rose-500">
              {dateCode?.toUpperCase()}
            </span>
          </div>
          <p className="text-xs text-gray-400">Share this code with your date so they can enter it at DateSpark.</p>
          <button
            onClick={copyCode}
            className="mt-1 text-sm text-rose-500 underline"
          >
            {copied ? 'Copied!' : 'Copy code'}
          </button>
        </div>

        <button
          onClick={() => navigate(`/code/${dateCode}`)}
          className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-2.5 rounded-xl transition-colors"
        >
          Share my code →
        </button>
      </div>
    </div>
  )
}
