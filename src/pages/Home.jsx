import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import PersonalityBadge from '../components/PersonalityBadge'

export default function Home() {
  const navigate = useNavigate()
  const { user, loading, signOut } = useAuth()
  const [profile, setProfile] = useState(null)
  const [answerCount, setAnswerCount] = useState(0)
  const [showBadge, setShowBadge] = useState(false)

  useEffect(() => {
    if (!user) return
    async function loadProfile() {
      const { data: p } = await supabase
        .from('profiles')
        .select('id, personality_badge, personality_summary')
        .eq('user_id', user.id)
        .maybeSingle()
      if (!p) return
      setProfile(p)
      const { count } = await supabase
        .from('profile_answers')
        .select('*', { count: 'exact', head: true })
        .eq('profile_id', p.id)
      setAnswerCount(count ?? 0)
    }
    loadProfile()
  }, [user])

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-rose-500">DateSpark ✨</h1>
          <p className="text-gray-500 text-sm mt-2">Find your perfect date, together.</p>
        </div>

        {/* Primary CTA */}
        <button
          onClick={() => navigate('/guest')}
          className="w-full bg-rose-500 hover:bg-rose-600 text-white rounded-2xl p-5 text-left transition-colors shadow-sm"
        >
          <div className="font-bold text-lg">Find date ideas</div>
        </button>

        {/* Secondary CTA */}
        <button
          onClick={() => navigate('/enter-code')}
          className="w-full bg-white hover:bg-rose-50 text-gray-800 border border-rose-100 rounded-2xl p-5 text-left transition-colors shadow-sm"
        >
          <div className="font-bold text-lg">I have a date code</div>
        </button>

        {/* Secret Planner — logged-in only */}
        {!loading && user && (
          <button
            onClick={() => navigate('/planner')}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-2xl p-5 text-left transition-colors shadow-sm"
          >
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-yellow-400 text-xs font-bold tracking-widest uppercase">Secret</span>
            </div>
            <div className="font-bold text-lg mb-0.5">Secret Planner ✦</div>
            <div className="text-gray-400 text-sm">Describe your date → AI plans the perfect night</div>
          </button>
        )}

        {/* Profile stats — logged-in with profile */}
        {!loading && user && profile && (
          <div className="bg-white border border-rose-100 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Questions answered</span>
              <span className="text-lg font-bold text-rose-500">{answerCount}</span>
            </div>
            {profile.personality_badge && (
              <button
                onClick={() => setShowBadge(s => !s)}
                className="w-full text-sm font-medium text-rose-500 hover:text-rose-700 transition-colors text-left"
              >
                {showBadge ? 'Hide' : 'View'} your personality assessment →
              </button>
            )}
            {showBadge && profile.personality_badge && (
              <PersonalityBadge badge={profile.personality_badge} summary={profile.personality_summary} />
            )}
          </div>
        )}

        {/* Log out */}
        {!loading && user && (
          <button
            onClick={signOut}
            className="w-full text-center text-xs text-gray-400 hover:text-rose-500 transition-colors pt-1"
          >
            Log out
          </button>
        )}

        {/* Login link for existing users */}
        {!loading && !user && (
          <p className="text-center text-xs text-gray-400 pt-2">
            Already have an account?{' '}
            <button onClick={() => navigate('/login')} className="text-rose-500 underline">
              Log in
            </button>
          </p>
        )}
      </div>
    </div>
  )
}
