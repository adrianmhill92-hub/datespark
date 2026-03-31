import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Dashboard from './Dashboard'

export default function Home() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-rose-200 border-t-rose-500 animate-spin" />
      </div>
    )
  }

  if (user) return <Dashboard />

  // Unauthenticated landing
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

        <p className="text-center text-xs text-gray-400 pt-2">
          Already have an account?{' '}
          <button onClick={() => navigate('/login')} className="text-rose-500 underline">
            Log in
          </button>
        </p>
      </div>
    </div>
  )
}
