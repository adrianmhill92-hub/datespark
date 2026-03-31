import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import PersonalityBadge from '../components/PersonalityBadge'
import BottomNav from '../components/BottomNav'

const INTERESTS = [
  'Hiking', 'Cooking', 'Movies', 'Music', 'Art', 'Travel', 'Gaming',
  'Reading', 'Sports', 'Dancing', 'Photography', 'Food & Drink',
  'Comedy', 'Outdoors', 'Fitness', 'Board Games',
]
const VIBES = ['Chill', 'Adventurous', 'Romantic', 'Playful', 'Cultural', 'Spontaneous']

// Normalize a DB value that may be a string, string[], or null → always string[]
function toArray(val) {
  if (!val) return []
  if (Array.isArray(val)) return val
  return [val]
}

const ONBOARD_QUESTIONS = [
  { key: 'q1',  question: 'Describe your ideal date in one sentence.',           type: 'text' },
  { key: 'q2',  question: 'Daytime or nighttime date?',                          type: 'choice', options: ['Daytime', 'Nighttime', 'Either works'] },
  { key: 'q3',  question: 'What time of day do you feel most like yourself?',    type: 'choice', options: ['Morning', 'Afternoon', 'Evening', 'Late night'] },
  { key: 'q4',  question: 'Pick a vibe.',                                        type: 'choice', options: ['Romantic', 'Fun', 'Chill', 'Impressive'] },
  { key: 'q5',  question: 'Name a cuisine you could eat every week.',            type: 'text' },
  { key: 'q6',  question: 'Spontaneous or planned — which are you really?',      type: 'choice', options: ['Spontaneous', 'Planned', 'Depends on my mood'] },
  { key: 'q7',  question: "What's something local you've never actually done?",  type: 'text' },
  { key: 'q8',  question: "What's a date that looked perfect on paper but fell flat?", type: 'text' },
  { key: 'q9',  question: 'How much talking vs doing do you prefer on a date?',  type: 'text' },
  { key: 'q10', question: "What's the most important thing about a great date?", type: 'text' },
]

const DAILY_QUESTIONS = [
  { key: 'dq1', question: 'What season makes the best backdrop for a date?',     type: 'choice', options: ['Spring', 'Summer', 'Fall', 'Winter'] },
  { key: 'dq2', question: 'Indoor or outdoor dates?',                            type: 'choice', options: ['Indoor', 'Outdoor', 'Mix of both'] },
  { key: 'dq3', question: "What's a dealbreaker on a first date?",               type: 'text' },
  { key: 'dq4', question: "First date — what's your move?",                      type: 'choice', options: ['Coffee', 'Dinner', 'Drinks', 'Activity'] },
  { key: 'dq5', question: 'How do you prefer to end a date?',                    type: 'choice', options: ['Kiss goodnight', 'Long walk', 'Another spot', 'See where it goes'] },
  { key: 'dq6', question: 'What song would set the perfect date mood?',          type: 'text' },
  { key: 'dq7', question: 'What do you always notice about a date?',             type: 'text' },
  { key: 'dq8', question: 'Active or relaxed dates?',                            type: 'choice', options: ['Active', 'Relaxed', 'Depends'] },
  { key: 'dq9', question: 'Best part of a first date?',                         type: 'choice', options: ['The conversation', 'The activity', 'The vibe', 'The end of it 😅'] },
  { key: 'dq10', question: 'What makes you feel most comfortable on a first date?', type: 'text' },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  // ── Remote data ─────────────────────────────────────────────────────────
  const [profile,  setProfile]  = useState(null)
  const [answers,  setAnswers]  = useState({})   // question_key → answer string
  const [sessions, setSessions] = useState([])
  const [ratings,  setRatings]  = useState({})   // "sessionId:title" → 1-5
  const [loading,  setLoading]  = useState(true)

  // ── Nav ──────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('home')

  // ── Home tab ─────────────────────────────────────────────────────────────
  const [showBadge,   setShowBadge]   = useState(false)
  const [dailyAnswer, setDailyAnswer] = useState('')
  const [dailySaving, setDailySaving] = useState(false)
  const [dailySaved,  setDailySaved]  = useState(false)

  // ── Dates tab ─────────────────────────────────────────────────────────────
  const [selectedSessionId, setSelectedSessionId] = useState(null)

  // ── Questions tab ─────────────────────────────────────────────────────────
  const [editAnswerKey,   setEditAnswerKey]   = useState(null)
  const [editAnswerValue, setEditAnswerValue] = useState('')

  // ── Profile tab ───────────────────────────────────────────────────────────
  const [editCity,      setEditCity]      = useState(null)  // null | string
  const [editInterests, setEditInterests] = useState(null)  // null | string[]
  const [editVibe,      setEditVibe]      = useState(null)  // null | string[]
  const [savingField,   setSavingField]   = useState(false)
  const [copied,        setCopied]        = useState(false)

  // ── Load all data ─────────────────────────────────────────────────────────
  useEffect(() => { if (user) loadAll() }, [user])

  async function loadAll() {
    setLoading(true)

    const { data: p } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!p) { setLoading(false); return }
    setProfile(p)

    const [{ data: ans }, { data: sess }] = await Promise.all([
      supabase.from('profile_answers').select('question_key, answer').eq('profile_id', p.id),
      supabase.from('date_sessions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    ])

    const ansMap = {}
    ans?.forEach(a => { ansMap[a.question_key] = a.answer })
    setAnswers(ansMap)

    const sessRows = sess || []
    setSessions(sessRows)

    if (sessRows.length) {
      const { data: rats } = await supabase
        .from('date_ratings')
        .select('session_id, activity_title, rating')
        .in('session_id', sessRows.map(s => s.id))
      const ratsMap = {}
      rats?.forEach(r => { ratsMap[`${r.session_id}:${r.activity_title}`] = r.rating })
      setRatings(ratsMap)
    }

    setLoading(false)
  }

  // ── Derived values ────────────────────────────────────────────────────────
  const dailyQuestion  = DAILY_QUESTIONS.find(q => !answers[q.key]) ?? null
  const questionCount  = Object.keys(answers).length
  const dateCount      = sessions.length
  const connectionCount = new Set(sessions.map(s => s.partner_name)).size
  const onboardAnswered = ONBOARD_QUESTIONS.filter(q => answers[q.key]).length
  const completionPct  = Math.round((onboardAnswered / ONBOARD_QUESTIONS.length) * 100)
  const initials       = profile
    ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  // ── Mutations ─────────────────────────────────────────────────────────────
  async function saveDailyAnswer() {
    if (!dailyAnswer.trim() || !profile || !dailyQuestion) return
    setDailySaving(true)
    await supabase.from('profile_answers').upsert(
      { profile_id: profile.id, question_key: dailyQuestion.key, answer: dailyAnswer },
      { onConflict: 'profile_id,question_key' }
    )
    setAnswers(a => ({ ...a, [dailyQuestion.key]: dailyAnswer }))
    setDailyAnswer('')
    setDailySaved(true)
    setDailySaving(false)
    setTimeout(() => setDailySaved(false), 2000)
  }

  async function saveRating(sessionId, activityTitle, rating) {
    const key = `${sessionId}:${activityTitle}`
    setRatings(r => ({ ...r, [key]: rating }))
    await supabase.from('date_ratings').upsert(
      { session_id: sessionId, activity_title: activityTitle, rating },
      { onConflict: 'session_id,activity_title' }
    )
  }

  async function saveAnswerEdit() {
    if (!editAnswerKey || !profile) return
    await supabase.from('profile_answers').upsert(
      { profile_id: profile.id, question_key: editAnswerKey, answer: editAnswerValue },
      { onConflict: 'profile_id,question_key' }
    )
    setAnswers(a => ({ ...a, [editAnswerKey]: editAnswerValue }))
    setEditAnswerKey(null)
    setEditAnswerValue('')
  }

  async function saveProfileField(field, value) {
    setSavingField(true)
    await supabase.from('profiles').update({ [field]: value }).eq('user_id', user.id)
    setProfile(p => ({ ...p, [field]: value }))
    setSavingField(false)
  }

  function copyCode() {
    if (!profile?.date_code) return
    navigator.clipboard.writeText(profile.date_code.toUpperCase())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── Loading / no-profile states ───────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-rose-200 border-t-rose-500 animate-spin" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center max-w-sm space-y-4">
          <p className="text-gray-600">No profile found for your account.</p>
          <button
            onClick={() => navigate('/onboard')}
            className="w-full bg-rose-500 text-white font-semibold py-2.5 rounded-xl"
          >
            Create your profile →
          </button>
        </div>
      </div>
    )
  }

  // ── HOME TAB ──────────────────────────────────────────────────────────────
  const homeTab = (
    <div className="space-y-4">
      {/* Header card */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-full bg-rose-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {initials}
          </div>
          <div>
            <h1 className="font-bold text-gray-800 text-lg leading-tight">
              Hey, {profile.name.split(' ')[0]} 👋
            </h1>
            <p className="text-gray-400 text-xs">{profile.city}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Questions', value: questionCount },
            { label: 'Dates',     value: dateCount },
            { label: 'Connections', value: connectionCount },
          ].map(s => (
            <div key={s.label} className="bg-rose-50 rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-rose-500">{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Personality badge card */}
      {profile.personality_badge && (
        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-800">Your personality</h2>
            <button
              onClick={() => setShowBadge(s => !s)}
              className="text-xs text-rose-500 font-medium"
            >
              {showBadge ? 'Hide' : 'View full'}
            </button>
          </div>

          {showBadge ? (
            <PersonalityBadge
              badge={profile.personality_badge}
              summary={profile.personality_summary}
            />
          ) : (
            <>
              <p className="font-semibold text-gray-700">{profile.personality_badge}</p>
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Profile completion</span>
                  <span>{completionPct}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-rose-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${completionPct}%` }}
                  />
                </div>
                {completionPct < 100 && (
                  <p className="text-xs text-gray-400 mt-1.5">
                    Answer more questions to complete your profile.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Daily question card */}
      {dailyQuestion ? (
        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
          <span className="text-xs font-semibold text-rose-400 tracking-widest uppercase">
            Daily question
          </span>
          <p className="font-semibold text-gray-800">{dailyQuestion.question}</p>

          {dailyQuestion.type === 'choice' ? (
            <div className="flex flex-col gap-2">
              {dailyQuestion.options.map(opt => (
                <button
                  key={opt}
                  onClick={() => setDailyAnswer(opt)}
                  className={`w-full py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                    dailyAnswer === opt
                      ? 'bg-rose-500 text-white border-rose-500'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-rose-300'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          ) : (
            <textarea
              value={dailyAnswer}
              onChange={e => setDailyAnswer(e.target.value)}
              placeholder="Type your answer…"
              rows={2}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none"
            />
          )}

          <button
            onClick={saveDailyAnswer}
            disabled={!dailyAnswer.trim() || dailySaving}
            className="w-full bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white font-semibold py-2 rounded-xl text-sm transition-colors"
          >
            {dailySaved ? '✓ Saved!' : dailySaving ? 'Saving…' : 'Save answer'}
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-6 shadow-sm text-center space-y-1">
          <p className="text-2xl">🎉</p>
          <p className="font-semibold text-gray-700">All caught up!</p>
          <p className="text-gray-400 text-sm">You've answered all available questions.</p>
        </div>
      )}
    </div>
  )

  // ── DATES TAB ─────────────────────────────────────────────────────────────
  const selectedSession = sessions.find(s => s.id === selectedSessionId)
  const uniquePartners  = [...new Set(sessions.map(s => s.partner_name))]

  const connectionDetail = selectedSession && (
    <div className="space-y-4">
      <button
        onClick={() => setSelectedSessionId(null)}
        className="text-rose-500 text-sm font-medium"
      >
        ← Back
      </button>
      <div>
        <h2 className="font-bold text-gray-800 text-lg">{selectedSession.partner_name}</h2>
        <p className="text-gray-400 text-xs">
          {new Date(selectedSession.created_at).toLocaleDateString('en-US', {
            month: 'long', day: 'numeric', year: 'numeric',
          })}
        </p>
      </div>
      <div className="space-y-3">
        {(selectedSession.suggestions || []).map((s, i) => {
          const rKey = `${selectedSession.id}:${s.title}`
          const currentRating = ratings[rKey] || 0
          return (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-gray-800 text-sm">{s.title}</h3>
                <span className="text-xs bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
                  {s.vibe}
                </span>
              </div>
              <p className="text-gray-600 text-xs leading-relaxed">{s.description}</p>
              <div className="flex gap-3 text-xs text-gray-400">
                <span>{s.budget}</span>
                <span>·</span>
                <span>{s.duration}</span>
              </div>
              <p className="text-xs text-rose-500 italic">{s.why}</p>
              <div className="flex gap-1 pt-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => saveRating(selectedSession.id, s.title, star)}
                    className={`text-xl transition-transform hover:scale-110 ${
                      currentRating >= star ? 'text-yellow-400' : 'text-gray-200'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  const datesTab = (
    <div className="space-y-5">
      {/* Previous dates */}
      <div>
        <h2 className="font-bold text-gray-800 mb-3">Previous dates</h2>
        {sessions.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 shadow-sm text-center space-y-2">
            <p className="text-3xl">📅</p>
            <p className="font-semibold text-gray-700">No dates yet</p>
            <p className="text-gray-400 text-sm">Generate date ideas with a match to see them here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.flatMap(sess =>
              (sess.suggestions || []).slice(0, 2).map((s, i) => {
                const rKey = `${sess.id}:${s.title}`
                const currentRating = ratings[rKey] || 0
                return (
                  <div key={`${sess.id}-${i}`} className="bg-white rounded-2xl p-4 shadow-sm space-y-2">
                    <p className="font-semibold text-gray-800 text-sm">{s.title}</p>
                    <p className="text-gray-400 text-xs">
                      with {sess.partner_name} · {new Date(sess.created_at).toLocaleDateString()}
                    </p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          onClick={() => saveRating(sess.id, s.title, star)}
                          className={`text-lg transition-transform hover:scale-110 ${
                            currentRating >= star ? 'text-yellow-400' : 'text-gray-200'
                          }`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>

      {/* Connections */}
      <div>
        <h2 className="font-bold text-gray-800 mb-3">Connections</h2>
        {uniquePartners.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 shadow-sm text-center space-y-2">
            <p className="text-3xl">🤝</p>
            <p className="font-semibold text-gray-700">No connections yet</p>
            <p className="text-gray-400 text-sm">Share your date code to start generating ideas.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {uniquePartners.map(partner => {
              const partnerSessions = sessions.filter(s => s.partner_name === partner)
              return (
                <button
                  key={partner}
                  onClick={() => setSelectedSessionId(partnerSessions[0].id)}
                  className="w-full bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 font-bold text-sm flex-shrink-0">
                      {partner.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{partner}</p>
                      <p className="text-gray-400 text-xs">
                        {partnerSessions.length} date{partnerSessions.length !== 1 ? 's' : ''} generated
                      </p>
                    </div>
                  </div>
                  <span className="text-gray-300">›</span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )

  // ── QUESTIONS TAB ─────────────────────────────────────────────────────────
  const allQuestions      = [...ONBOARD_QUESTIONS, ...DAILY_QUESTIONS]
  const answeredQuestions = allQuestions.filter(q => answers[q.key])
  const unansweredDaily   = DAILY_QUESTIONS.filter(q => !answers[q.key])

  const questionsTab = (
    <div className="space-y-5">
      {/* Answered Q&A */}
      <div>
        <h2 className="font-bold text-gray-800 mb-3">
          Your answers <span className="text-gray-400 font-normal text-sm">({answeredQuestions.length})</span>
        </h2>
        {answeredQuestions.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
            <p className="text-gray-400 text-sm">Complete onboarding to see your answers here.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {answeredQuestions.map(q => (
              <div key={q.key} className="bg-white rounded-2xl p-4 shadow-sm">
                {editAnswerKey === q.key ? (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500 font-medium">{q.question}</p>
                    {q.type === 'choice' && q.options ? (
                      <div className="flex flex-wrap gap-1.5">
                        {q.options.map(opt => (
                          <button
                            key={opt}
                            onClick={() => setEditAnswerValue(opt)}
                            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                              editAnswerValue === opt
                                ? 'bg-rose-500 text-white border-rose-500'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-rose-300'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <textarea
                        value={editAnswerValue}
                        onChange={e => setEditAnswerValue(e.target.value)}
                        rows={2}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none"
                      />
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={saveAnswerEdit}
                        disabled={!editAnswerValue.trim()}
                        className="flex-1 bg-rose-500 disabled:bg-rose-300 text-white text-xs font-semibold py-1.5 rounded-lg"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => { setEditAnswerKey(null); setEditAnswerValue('') }}
                        className="flex-1 border border-gray-200 text-gray-600 text-xs font-medium py-1.5 rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400 mb-0.5">{q.question}</p>
                      <p className="text-sm font-medium text-gray-800">{answers[q.key]}</p>
                    </div>
                    <button
                      onClick={() => { setEditAnswerKey(q.key); setEditAnswerValue(answers[q.key] || '') }}
                      className="text-xs text-rose-400 hover:text-rose-600 flex-shrink-0"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Unanswered daily questions */}
      {unansweredDaily.length > 0 && (
        <div>
          <h2 className="font-bold text-gray-800 mb-3">
            Still to answer <span className="text-gray-400 font-normal text-sm">({unansweredDaily.length})</span>
          </h2>
          <div className="space-y-2">
            {unansweredDaily.map(q => (
              <div key={q.key} className="bg-white rounded-2xl px-4 py-3 shadow-sm">
                <p className="text-sm text-gray-500">{q.question}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  // ── PROFILE TAB ───────────────────────────────────────────────────────────
  const profileTab = (
    <div className="space-y-4">
      {/* City */}
      <div className="bg-white rounded-2xl p-5 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">City</h3>
          {editCity === null && (
            <button
              onClick={() => setEditCity(profile.city)}
              className="text-xs text-rose-400 hover:text-rose-600"
            >
              Edit
            </button>
          )}
        </div>
        {editCity !== null ? (
          <div className="space-y-2">
            <input
              type="text"
              value={editCity}
              onChange={e => setEditCity(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
            />
            <div className="flex gap-2">
              <button
                onClick={async () => { await saveProfileField('city', editCity); setEditCity(null) }}
                disabled={savingField || !editCity.trim()}
                className="flex-1 bg-rose-500 disabled:bg-rose-300 text-white text-xs font-semibold py-1.5 rounded-lg"
              >
                {savingField ? 'Saving…' : 'Save'}
              </button>
              <button
                onClick={() => setEditCity(null)}
                className="flex-1 border border-gray-200 text-gray-600 text-xs font-medium py-1.5 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-600 text-sm">{profile.city}</p>
        )}
      </div>

      {/* Interests */}
      <div className="bg-white rounded-2xl p-5 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">Interests</h3>
          {editInterests === null && (
            <button
              onClick={() => setEditInterests(toArray(profile.interests))}
              className="text-xs text-rose-400 hover:text-rose-600"
            >
              Edit
            </button>
          )}
        </div>
        {editInterests !== null ? (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map(i => (
                <button
                  key={i}
                  onClick={() => setEditInterests(prev =>
                    prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
                  )}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    editInterests.includes(i)
                      ? 'bg-rose-500 text-white border-rose-500'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-rose-300'
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={async () => { await saveProfileField('interests', editInterests); setEditInterests(null) }}
                disabled={savingField}
                className="flex-1 bg-rose-500 disabled:bg-rose-300 text-white text-xs font-semibold py-1.5 rounded-lg"
              >
                {savingField ? 'Saving…' : 'Save'}
              </button>
              <button
                onClick={() => setEditInterests(null)}
                className="flex-1 border border-gray-200 text-gray-600 text-xs font-medium py-1.5 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {toArray(profile.interests).map(i => (
              <span key={i} className="px-2.5 py-1 bg-rose-50 text-rose-600 rounded-full text-xs font-medium">{i}</span>
            ))}
          </div>
        )}
      </div>

      {/* Date vibe */}
      <div className="bg-white rounded-2xl p-5 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">Date vibe</h3>
          {editVibe === null && (
            <button
              onClick={() => setEditVibe(toArray(profile.vibe))}
              className="text-xs text-rose-400 hover:text-rose-600"
            >
              Edit
            </button>
          )}
        </div>
        {editVibe !== null ? (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {VIBES.map(v => (
                <button
                  key={v}
                  onClick={() => setEditVibe(prev =>
                    prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]
                  )}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    editVibe.includes(v)
                      ? 'bg-pink-500 text-white border-pink-500'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-pink-300'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={async () => { await saveProfileField('vibe', editVibe); setEditVibe(null) }}
                disabled={savingField}
                className="flex-1 bg-rose-500 disabled:bg-rose-300 text-white text-xs font-semibold py-1.5 rounded-lg"
              >
                {savingField ? 'Saving…' : 'Save'}
              </button>
              <button
                onClick={() => setEditVibe(null)}
                className="flex-1 border border-gray-200 text-gray-600 text-xs font-medium py-1.5 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {toArray(profile.vibe).map(v => (
              <span key={v} className="px-2.5 py-1 bg-pink-50 text-pink-600 rounded-full text-xs font-medium">{v}</span>
            ))}
            {!toArray(profile.vibe).length && (
              <span className="text-gray-400 text-sm">None set</span>
            )}
          </div>
        )}
      </div>

      {/* Date code + Generate CTA */}
      <div className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
        <h3 className="font-semibold text-gray-800">Your date code</h3>
        <div className="bg-rose-50 border-2 border-rose-200 rounded-xl py-3 text-center">
          <span className="text-2xl font-mono font-bold tracking-[0.2em] text-rose-500">
            {profile.date_code?.toUpperCase()}
          </span>
        </div>
        <button
          onClick={copyCode}
          className="w-full border border-rose-200 text-rose-500 hover:bg-rose-50 font-medium py-2 rounded-xl text-sm transition-colors"
        >
          {copied ? 'Copied!' : 'Copy code'}
        </button>
        <button
          onClick={() => navigate(`/match/${profile.date_code}`)}
          className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
        >
          Generate new date ideas →
        </button>
      </div>

      {/* Log out */}
      <button
        onClick={signOut}
        className="w-full text-center text-xs text-gray-400 hover:text-rose-500 transition-colors py-2"
      >
        Log out
      </button>
    </div>
  )

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100">
      <div className="max-w-sm mx-auto px-4 pt-6 pb-28">
        {activeTab === 'home'      && homeTab}
        {activeTab === 'dates'     && (selectedSessionId ? connectionDetail : datesTab)}
        {activeTab === 'questions' && questionsTab}
        {activeTab === 'profile'   && profileTab}
      </div>
      <BottomNav activeTab={activeTab} onTabChange={tab => {
        setActiveTab(tab)
        setSelectedSessionId(null) // reset connection detail on tab switch
      }} />
    </div>
  )
}
