import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import QuestionScreen from '../../components/QuestionScreen'

const QUESTIONS = [
  {
    key: 'q1',
    question: 'Describe your ideal date in one sentence.',
    type: 'text',
  },
  {
    key: 'q2',
    question: 'Daytime or nighttime date?',
    type: 'choice',
    options: ['Daytime', 'Nighttime', 'Either works'],
  },
  {
    key: 'q3',
    question: 'What time of day do you feel most like yourself?',
    type: 'choice',
    options: ['Morning', 'Afternoon', 'Evening', 'Late night'],
  },
  {
    key: 'q4',
    question: 'Pick a vibe.',
    type: 'choice',
    options: ['Romantic', 'Fun', 'Chill', 'Impressive'],
  },
  {
    key: 'q5',
    question: 'Name a cuisine you could eat every week.',
    type: 'text',
  },
  {
    key: 'q6',
    question: 'Spontaneous or planned — which are you really?',
    type: 'choice',
    options: ['Spontaneous', 'Planned', 'Depends on my mood'],
  },
  {
    key: 'q7',
    question: "What's something local you've never actually done?",
    type: 'text',
  },
  {
    key: 'q8',
    question: "What's a date that looked perfect on paper but fell flat?",
    type: 'text',
  },
  {
    key: 'q9',
    question: 'How much talking vs doing do you prefer on a date?',
    type: 'slider',
  },
  {
    key: 'q10',
    question: "What's the most important thing about a great date?",
    type: 'text',
  },
]

export default function OnboardQuestions() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const { profileId, dateCode } = state || {}

  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const q = QUESTIONS[step]
  const currentAnswer = answers[q.key]

  function handleAnswer(value) {
    setAnswers(a => ({ ...a, [q.key]: value }))
  }

  function handleNext() {
    if (step < QUESTIONS.length - 1) {
      setStep(s => s + 1)
    } else {
      handleFinish()
    }
  }

  async function handleFinish() {
    if (!profileId) { setError('Session lost — please start over.'); return }
    setSaving(true)

    const rows = Object.entries(answers).map(([question_key, answer]) => ({
      profile_id: profileId,
      question_key,
      answer: typeof answer === 'number' ? String(answer) : answer,
    }))

    const { error: dbError } = await supabase.from('profile_answers').upsert(rows, { onConflict: 'profile_id,question_key' })
    if (dbError) { setError(dbError.message); setSaving(false); return }

    navigate('/onboard/personality', { state: { profileId, dateCode, answers } })
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

  if (saving) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-4 border-rose-200 border-t-rose-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Saving your answers…</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-100 text-red-600 px-4 py-2 rounded-full text-sm z-50">
          {error}
        </div>
      )}
      <QuestionScreen
        question={q.question}
        type={q.type}
        options={q.options}
        value={currentAnswer}
        onChange={handleAnswer}
        onNext={handleNext}
        onBack={step > 0 ? () => setStep(s => s - 1) : null}
        current={step + 1}
        total={QUESTIONS.length}
      />
    </>
  )
}
