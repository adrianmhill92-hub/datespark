import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { generateDateCode } from '../lib/dateCode'

const INTERESTS = [
  'Hiking', 'Cooking', 'Movies', 'Music', 'Art', 'Travel', 'Gaming',
  'Reading', 'Sports', 'Dancing', 'Photography', 'Food & Drink',
  'Comedy', 'Outdoors', 'Fitness', 'Board Games',
]

const VIBES = ['Chill', 'Adventurous', 'Romantic', 'Playful', 'Cultural', 'Spontaneous']
const TRAVEL_OPTIONS = ['5', '10', '25', '50', 'any']

export default function ProfileSetup() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    age: '',
    city: '',
    zip_code: '',
    travel_miles: '25',
    interests: [],
    vibes: [],
    budget: 'medium',
    notes: '',
    has_car: null,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function toggleVibe(vibe) {
    setForm(f => ({
      ...f,
      vibes: f.vibes.includes(vibe)
        ? f.vibes.filter(v => v !== vibe)
        : [...f.vibes, vibe],
    }))
  }

  function toggleInterest(interest) {
    setForm(f => ({
      ...f,
      interests: f.interests.includes(interest)
        ? f.interests.filter(i => i !== interest)
        : [...f.interests, interest],
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name || !form.city || form.interests.length === 0 || form.vibes.length === 0) {
      setError('Please fill in all required fields and pick at least one interest and vibe.')
      return
    }

    setLoading(true)
    setError(null)

    const dateCode = generateDateCode()

    const { error: dbError } = await supabase.from('profiles').insert({
      date_code: dateCode,
      name: form.name,
      age: form.age ? parseInt(form.age, 10) : null,
      city: form.city,
      zip_code: form.zip_code || null,
      travel_miles: form.travel_miles,
      interests: form.interests,
      vibes: form.vibes,
      budget: form.budget,
      notes: form.notes,
      has_car: form.has_car,
    })

    if (dbError) {
      setError(dbError.message)
      setLoading(false)
      return
    }

    navigate(`/code/${dateCode}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-8">
        <h1 className="text-3xl font-bold text-rose-500 mb-1">DateSpark ✨</h1>
        <p className="text-gray-500 mb-6 text-sm">Fill in your profile to get your date code.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Your first name"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
            />
          </div>

          {/* Age + City + Zip */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
              <input
                type="number"
                value={form.age}
                onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                placeholder="25"
                min="18"
                max="99"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
              <input
                type="text"
                value={form.city}
                onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                placeholder="New York"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Zip code</label>
              <input
                type="text"
                value={form.zip_code}
                onChange={e => setForm(f => ({ ...f, zip_code: e.target.value }))}
                placeholder="10001"
                maxLength={10}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
            </div>
          </div>

          {/* Travel distance */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Miles willing to travel —{' '}
              <span className="text-rose-500 font-semibold">
                {form.travel_miles === 'any' ? 'Any distance' : `${form.travel_miles} miles`}
              </span>
            </label>
            <input
              type="range"
              min="0"
              max="4"
              step="1"
              value={TRAVEL_OPTIONS.indexOf(form.travel_miles)}
              onChange={e => setForm(f => ({ ...f, travel_miles: TRAVEL_OPTIONS[e.target.value] }))}
              className="w-full accent-rose-500"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              {TRAVEL_OPTIONS.map(o => <span key={o}>{o === 'any' ? 'Any' : o}</span>)}
            </div>
          </div>

          {/* Interests */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Interests * (pick any)</label>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map(i => (
                <button
                  key={i}
                  type="button"
                  onClick={() => toggleInterest(i)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    form.interests.includes(i)
                      ? 'bg-rose-500 text-white border-rose-500'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-rose-300'
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          {/* Vibe */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date vibe * (pick all that apply)</label>
            <div className="flex flex-wrap gap-2">
              {VIBES.map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => toggleVibe(v)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    form.vibes.includes(v)
                      ? 'bg-pink-500 text-white border-pink-500'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-pink-300'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Budget</label>
            <div className="flex gap-2">
              {['low', 'medium', 'high'].map(b => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, budget: b }))}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium border capitalize transition-colors ${
                    form.budget === b
                      ? 'bg-rose-500 text-white border-rose-500'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-rose-300'
                  }`}
                >
                  {b === 'low' ? '$ Low' : b === 'medium' ? '$$ Medium' : '$$$ High'}
                </button>
              ))}
            </div>
          </div>

          {/* Has car */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Do you have a car?</label>
            <div className="flex gap-3">
              {[true, false].map(v => (
                <button key={String(v)} type="button" onClick={() => setForm(f => ({ ...f, has_car: v }))}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${
                    form.has_car === v ? 'bg-rose-500 text-white border-rose-500' : 'bg-white text-gray-600 border-gray-200 hover:border-rose-300'
                  }`}>
                  {v ? 'Yes' : 'No'}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Anything else?</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Dietary restrictions, mobility needs, pet-friendly spots..."
              rows={2}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white font-semibold py-2.5 rounded-xl transition-colors"
          >
            {loading ? 'Saving…' : 'Get my date code →'}
          </button>
        </form>
      </div>
    </div>
  )
}
