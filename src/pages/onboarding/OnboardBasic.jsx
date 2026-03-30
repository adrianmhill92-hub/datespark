import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { generateDateCode } from '../../lib/dateCode'

const INTERESTS = [
  'Hiking', 'Cooking', 'Movies', 'Music', 'Art', 'Travel', 'Gaming',
  'Reading', 'Sports', 'Dancing', 'Photography', 'Food & Drink',
  'Comedy', 'Outdoors', 'Fitness', 'Board Games',
]

const VIBES = ['Chill', 'Adventurous', 'Romantic', 'Playful', 'Cultural', 'Spontaneous']
const TRAVEL_OPTIONS = ['5', '10', '25', '50', 'any']

export default function OnboardBasic() {
  const navigate = useNavigate()
  const prefill = (() => {
    try { return JSON.parse(sessionStorage.getItem('guestAnswers') || 'null') } catch { return null }
  })()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    age: '',
    city: prefill?.city || '',
    zip_code: prefill?.zip_code || '',
    travel_miles: prefill?.travel_miles || '25',
    interests: prefill?.interests || [],
    vibe: Array.isArray(prefill?.vibe) ? prefill.vibe : (prefill?.vibe ? [prefill.vibe] : []),
    has_car: null,
    context: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function toggleInterest(i) {
    setForm(f => ({
      ...f,
      interests: f.interests.includes(i) ? f.interests.filter(x => x !== i) : [...f.interests, i],
    }))
  }

  function toggleVibe(v) {
    setForm(f => ({
      ...f,
      vibe: f.vibe.includes(v) ? f.vibe.filter(x => x !== v) : [...f.vibe, v],
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name || !form.email || !form.password || !form.city || form.interests.length === 0 || form.vibe.length === 0) {
      setError('Please fill in all required fields.')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    setError(null)

    // Create auth account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })
    if (authError) { setError(authError.message); setLoading(false); return }

    const dateCode = generateDateCode()
    const { data: profile, error: dbError } = await supabase.from('profiles').insert({
      date_code: dateCode,
      user_id: authData.user?.id ?? null,
      name: form.name,
      email: form.email,
      phone: form.phone || null,
      age: form.age ? parseInt(form.age, 10) : null,
      city: form.city,
      zip_code: form.zip_code || null,
      travel_miles: form.travel_miles,
      interests: form.interests,
      vibe: form.vibe,
      has_car: form.has_car,
      notes: form.context || null,
      is_guest: false,
    }).select('id').single()

    if (dbError) { setError(dbError.message); setLoading(false); return }

    sessionStorage.removeItem('guestAnswers')
    // Pass profile id + date code to next step
    navigate('/onboard/questions', { state: { profileId: profile.id, dateCode } })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-8">
        <div className="mb-6">
          <p className="text-xs font-semibold text-rose-400 tracking-widest uppercase mb-1">Step 1 of 12</p>
          <h1 className="text-2xl font-bold text-gray-800">Tell us about yourself</h1>
          <p className="text-gray-400 text-sm mt-1">Then 10 quick questions for your personality badge.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name + Age */}
          <div className="flex gap-3">
            <div className="flex-[2]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="First name" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
              <input type="number" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                placeholder="25" min="18" max="99" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="you@example.com" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
          </div>

          {/* Password + Confirm Password */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
              <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="8+ characters" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm password *</label>
              <input type="password" value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                placeholder="Re-enter password" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="Optional" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
          </div>

          {/* City + Zip */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
              <input type="text" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                placeholder="New York" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Zip code</label>
              <input type="text" value={form.zip_code} onChange={e => setForm(f => ({ ...f, zip_code: e.target.value }))}
                placeholder="10001" maxLength={10} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
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
            <input type="range" min="0" max="4" step="1"
              value={TRAVEL_OPTIONS.indexOf(form.travel_miles)}
              onChange={e => setForm(f => ({ ...f, travel_miles: TRAVEL_OPTIONS[e.target.value] }))}
              className="w-full accent-rose-500" />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              {TRAVEL_OPTIONS.map(o => <span key={o}>{o === 'any' ? 'Any' : o}</span>)}
            </div>
          </div>

          {/* Interests */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Interests * (pick any)</label>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map(i => (
                <button key={i} type="button" onClick={() => toggleInterest(i)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    form.interests.includes(i) ? 'bg-rose-500 text-white border-rose-500' : 'bg-white text-gray-600 border-gray-200 hover:border-rose-300'
                  }`}>{i}</button>
              ))}
            </div>
          </div>

          {/* Vibe */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date vibe * (pick all that apply)</label>
            <div className="flex flex-wrap gap-2">
              {VIBES.map(v => (
                <button key={v} type="button"
                  onClick={() => toggleVibe(v)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    form.vibe.includes(v) ? 'bg-pink-500 text-white border-pink-500' : 'bg-white text-gray-600 border-gray-200 hover:border-pink-300'
                  }`}>{v}</button>
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

          {/* Context */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Anything else we should know?</label>
            <textarea value={form.context} onChange={e => setForm(f => ({ ...f, context: e.target.value }))}
              placeholder="Dietary restrictions, accessibility needs, anything goes…"
              rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none" />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white font-semibold py-2.5 rounded-xl transition-colors">
            {loading ? 'Creating account…' : 'Continue to questions →'}
          </button>
        </form>
      </div>
    </div>
  )
}
