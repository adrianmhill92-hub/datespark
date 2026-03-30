import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const INTERESTS = [
  'Hiking', 'Cooking', 'Movies', 'Music', 'Art', 'Travel', 'Gaming',
  'Reading', 'Sports', 'Dancing', 'Photography', 'Food & Drink',
  'Comedy', 'Outdoors', 'Fitness', 'Board Games',
]

const VIBES = ['Chill', 'Adventurous', 'Romantic', 'Playful', 'Cultural', 'Spontaneous']

const BUDGETS = [
  { key: 'under_20', label: 'Under $20' },
  { key: '20_50', label: '$20–$50' },
  { key: '50_100', label: '$50–$100' },
  { key: '100_plus', label: '$100+' },
]

const GROUP_SIZES = [
  { key: 'just_us', label: 'Just us 2' },
  { key: 'small_group', label: 'Small group (3–5)' },
  { key: 'big_group', label: 'Big group (6+)' },
]

export default function GuestQuestions() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({
    city: '',
    interests: [],
    vibe: [],
    budget: 'under_20',
    group_size: 'just_us',
  })

  function canAdvance() {
    if (step === 0) return answers.city.trim().length > 0
    if (step === 1) return answers.vibe.length > 0
    if (step === 2) return answers.interests.length > 0
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

  function toggleVibe(v) {
    setAnswers(a => ({
      ...a,
      vibe: a.vibe.includes(v) ? a.vibe.filter(x => x !== v) : [...a.vibe, v],
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

        {/* Step 0: City */}
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800">What's your city?</h2>
            <input
              type="text"
              value={answers.city}
              onChange={e => setAnswers(a => ({ ...a, city: e.target.value }))}
              placeholder="New York"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
            />
          </div>
        )}

        {/* Step 1: Vibe (multi-select chips) */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">What's your vibe?</h2>
              <p className="text-gray-400 text-sm mt-1">Pick all that apply.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {VIBES.map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => toggleVibe(v)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    answers.vibe.includes(v)
                      ? 'bg-rose-500 text-white border-rose-500'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-rose-300'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Interests */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">What are you into?</h2>
              <p className="text-gray-400 text-sm mt-1">Pick any that apply.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map(i => (
                <button
                  key={i}
                  type="button"
                  onClick={() => toggleInterest(i)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
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

        {/* Step 3: Budget */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800">What's your budget?</h2>
            <div className="flex flex-col gap-2">
              {BUDGETS.map(b => (
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

        {/* Step 4: Group size */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800">How many people?</h2>
            <div className="flex flex-col gap-2">
              {GROUP_SIZES.map(g => (
                <button
                  key={g.key}
                  type="button"
                  onClick={() => setAnswers(a => ({ ...a, group_size: g.key }))}
                  className={`w-full py-3 rounded-xl text-sm font-medium border transition-colors ${
                    answers.group_size === g.key
                      ? 'bg-rose-500 text-white border-rose-500'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-rose-300'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleNext}
          disabled={!canAdvance()}
          className="mt-6 w-full bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white font-semibold py-2.5 rounded-xl transition-colors"
        >
          {step < 4 ? 'Next →' : 'Find my date ideas →'}
        </button>
      </div>
    </div>
  )
}
