import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const INTERESTS = [
  'Hiking', 'Cooking', 'Movies', 'Music', 'Art', 'Travel', 'Gaming',
  'Reading', 'Sports', 'Dancing', 'Photography', 'Food & Drink',
  'Comedy', 'Outdoors', 'Fitness', 'Board Games',
]

const VIBES = ['Chill', 'Adventurous', 'Romantic', 'Playful', 'Cultural', 'Spontaneous']

export default function GuestQuestions() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({
    city: '',
    zip_code: '',
    interests: [],
    vibe: '',
    budget: 'medium',
    when: '',
  })

  function canAdvance() {
    if (step === 0) return answers.city.trim().length > 0
    if (step === 1) return answers.interests.length > 0
    if (step === 2) return !!answers.vibe
    if (step === 3) return true
    if (step === 4) return true
    return true
  }

  function handleNext() {
    if (step < 4) {
      setStep(s => s + 1)
    } else {
      sessionStorage.setItem('guestAnswers', JSON.stringify(answers))
      navigate('/guest/results', { state: { answers } })
    }
  }

  function toggleInterest(i) {
    setAnswers(a => ({
      ...a,
      interests: a.interests.includes(i) ? a.interests.filter(x => x !== i) : [...a.interests, i],
    }))
  }

  const progress = ((step + 1) / 5) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-8">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs font-semibold text-rose-400 tracking-widest uppercase">
              Question {step + 1} of 5
            </p>
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)} className="text-gray-400 text-sm hover:text-gray-600">
                ← Back
              </button>
            )}
          </div>
          <div className="w-full bg-rose-100 rounded-full h-1.5">
            <div
              className="bg-rose-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step 0: City + zip */}
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800">Where are you based?</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
              <input
                type="text"
                value={answers.city}
                onChange={e => setAnswers(a => ({ ...a, city: e.target.value }))}
                placeholder="New York"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Zip code (optional)</label>
              <input
                type="text"
                value={answers.zip_code}
                onChange={e => setAnswers(a => ({ ...a, zip_code: e.target.value }))}
                placeholder="10001"
                maxLength={10}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
            </div>
          </div>
        )}

        {/* Step 1: Interests */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800">What are you into?</h2>
            <p className="text-gray-400 text-sm">Pick any that apply.</p>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map(i => (
                <button
                  key={i}
                  type="button"
                  onClick={() => toggleInterest(i)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    answers.interests.includes(i)
                      ? 'bg-rose-500 text-white border-rose-500'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-rose-300'
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Vibe */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800">Pick a date vibe.</h2>
            <div className="flex flex-col gap-2">
              {VIBES.map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => {
                    setAnswers(a => ({ ...a, vibe: v }))
                  }}
                  className={`w-full py-3 rounded-xl text-sm font-medium border transition-colors ${
                    answers.vibe === v
                      ? 'bg-rose-500 text-white border-rose-500'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-rose-300'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Budget */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800">What's your budget?</h2>
            <div className="flex flex-col gap-2">
              {[
                { key: 'low', label: '$ Low — under $30/person' },
                { key: 'medium', label: '$$ Medium — $30–$75/person' },
                { key: 'high', label: '$$$ High — $75+/person' },
              ].map(b => (
                <button
                  key={b.key}
                  type="button"
                  onClick={() => setAnswers(a => ({ ...a, budget: b.key }))}
                  className={`w-full py-3 rounded-xl text-sm font-medium border transition-colors ${
                    answers.budget === b.key
                      ? 'bg-rose-500 text-white border-rose-500'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-rose-300'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: When */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800">When is the date?</h2>
            <p className="text-gray-400 text-sm">Optional — helps tailor the suggestions.</p>
            <input
              type="date"
              value={answers.when}
              onChange={e => setAnswers(a => ({ ...a, when: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
            />
          </div>
        )}

        <button
          onClick={handleNext}
          disabled={!canAdvance()}
          className="mt-6 w-full bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white font-semibold py-2.5 rounded-xl transition-colors"
        >
          {step < 4 ? 'Next →' : 'Get my date ideas →'}
        </button>
      </div>
    </div>
  )
}
