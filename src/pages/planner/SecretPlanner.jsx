import { useState } from 'react'
import { getPlannerQuestions, getDatePlan } from '../../lib/claude'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

export default function SecretPlanner() {
  const { user } = useAuth()
  const [phase, setPhase] = useState('context') // 'context' | 'questions' | 'plan'
  const [context, setContext] = useState('')
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState([])
  const [questionStep, setQuestionStep] = useState(0)
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(null)

  async function handleContextSubmit(e) {
    e.preventDefault()
    if (!context.trim()) return
    setLoading(true)
    setError(null)
    try {
      const qs = await getPlannerQuestions(context)
      setQuestions(qs)
      setAnswers(qs.map(q => ({ question: q, answer: '' })))
      setPhase('questions')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleAnswerNext() {
    const updated = answers.map((a, i) =>
      i === questionStep ? { ...a, answer: currentAnswer } : a
    )
    setAnswers(updated)
    setCurrentAnswer('')
    if (questionStep < questions.length - 1) {
      setQuestionStep(s => s + 1)
    } else {
      submitPlan(updated)
    }
  }

  function handleAnswerBack() {
    if (questionStep === 0) {
      setPhase('context')
    } else {
      setQuestionStep(s => s - 1)
      setCurrentAnswer(answers[questionStep - 1]?.answer ?? '')
    }
  }

  async function submitPlan(finalAnswers) {
    setLoading(true)
    setError(null)
    try {
      const result = await getDatePlan(context, finalAnswers)

      // Save to profile_answers if logged in
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle()
        if (profile) {
          const rows = [
            { profile_id: profile.id, question_key: 'planner_context', answer: context },
            ...finalAnswers.map((qa, i) => ({
              profile_id: profile.id,
              question_key: `planner_q${i + 1}`,
              answer: qa.answer,
            })),
          ]
          await supabase.from('profile_answers').upsert(rows, { onConflict: 'profile_id,question_key' })
        }
      }

      setPlan(result)
      setPhase('plan')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function copyQuestion(text, i) {
    navigator.clipboard.writeText(text)
    setCopied(i)
    setTimeout(() => setCopied(null), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-4 border-gray-700 border-t-yellow-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">
            {phase === 'context' ? 'Crafting your questions…' : 'Building your date plan…'}
          </p>
        </div>
      </div>
    )
  }

  // Phase: context
  if (phase === 'context') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <span className="text-yellow-400 text-xs font-bold tracking-widest uppercase">Secret Planner ✦</span>
            <h1 className="text-2xl font-bold text-white mt-2">Tell me about your date</h1>
            <p className="text-gray-400 text-sm mt-1">Who are you planning for? What matters to them?</p>
          </div>

          <form onSubmit={handleContextSubmit} className="space-y-4">
            <textarea
              value={context}
              onChange={e => setContext(e.target.value)}
              placeholder="e.g. Planning a second date for someone who loves art and good food, we're in Brooklyn, budget around $100 total…"
              rows={5}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={!context.trim()}
              className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:bg-gray-700 disabled:text-gray-500 text-gray-900 font-semibold py-2.5 rounded-xl transition-colors"
            >
              Generate my questions →
            </button>
          </form>
        </div>
      </div>
    )
  }

  // Phase: questions (one per screen)
  if (phase === 'questions') {
    const q = questions[questionStep]
    const progress = ((questionStep + 1) / questions.length) * 100

    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-yellow-400 text-xs font-bold tracking-widest uppercase">
                Question {questionStep + 1} of {questions.length}
              </span>
              <button onClick={handleAnswerBack} className="text-gray-500 text-sm hover:text-gray-300">
                ← Back
              </button>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-1.5">
              <div
                className="bg-yellow-400 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs text-gray-500 uppercase tracking-widest">Ask your date:</p>
            <div className="bg-gray-900 rounded-xl p-4">
              <p className="text-white font-medium leading-relaxed">{q}</p>
              <button
                onClick={() => copyQuestion(q, questionStep)}
                className="mt-2 text-xs text-gray-500 hover:text-yellow-400 transition-colors"
              >
                {copied === questionStep ? 'Copied!' : 'Copy to clipboard'}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs text-gray-500 uppercase tracking-widest">Their answer:</p>
            <textarea
              value={currentAnswer}
              onChange={e => setCurrentAnswer(e.target.value)}
              placeholder="Type what they said…"
              rows={3}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            onClick={handleAnswerNext}
            disabled={!currentAnswer.trim()}
            className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:bg-gray-700 disabled:text-gray-500 text-gray-900 font-semibold py-2.5 rounded-xl transition-colors"
          >
            {questionStep < questions.length - 1 ? 'Next question →' : 'Build my date plan →'}
          </button>
        </div>
      </div>
    )
  }

  // Phase: plan
  return (
    <div className="min-h-screen bg-gray-950 p-4">
      <div className="max-w-sm mx-auto space-y-4 py-8">
        <div className="text-center">
          <span className="text-yellow-400 text-xs font-bold tracking-widest uppercase">Your plan ✦</span>
          <h1 className="text-2xl font-bold text-white mt-1">{plan.title}</h1>
          <p className="text-gray-400 text-sm mt-2">{plan.intro}</p>
        </div>

        {/* Itinerary */}
        <div className="bg-gray-900 rounded-2xl p-5 space-y-4">
          <h2 className="text-yellow-400 text-xs font-bold tracking-widest uppercase">The evening</h2>
          {plan.itinerary?.map((item, i) => (
            <div key={i} className="flex gap-3">
              <span className="text-gray-500 text-sm w-16 shrink-0">{item.time}</span>
              <div>
                <p className="text-white font-medium text-sm">{item.activity}</p>
                <p className="text-gray-500 text-xs mt-0.5">{item.why}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Booking tips */}
        {plan.bookingTips?.length > 0 && (
          <div className="bg-gray-900 rounded-2xl p-5 space-y-2">
            <h2 className="text-yellow-400 text-xs font-bold tracking-widest uppercase">Tips</h2>
            {plan.bookingTips.map((tip, i) => (
              <p key={i} className="text-gray-300 text-sm">• {tip}</p>
            ))}
          </div>
        )}

        {/* Personal touch */}
        {plan.personalTouch && (
          <div className="bg-yellow-400 rounded-2xl p-5">
            <p className="text-xs font-bold tracking-widest uppercase text-yellow-900 mb-1">Personal touch</p>
            <p className="text-gray-900 font-medium text-sm">{plan.personalTouch}</p>
          </div>
        )}

        <button
          onClick={() => { setPhase('context'); setContext(''); setQuestions([]); setAnswers([]); setQuestionStep(0); setPlan(null) }}
          className="w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2.5 rounded-xl transition-colors"
        >
          Plan another date
        </button>
      </div>
    </div>
  )
}
