import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Home() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-rose-500">DateSpark ✨</h1>
          <p className="text-gray-500 text-sm mt-2">Find your perfect date, together.</p>
        </div>

        {/* Path A */}
        <button
          onClick={() => navigate('/onboard')}
          className="w-full bg-rose-500 hover:bg-rose-600 text-white rounded-2xl p-5 text-left transition-colors shadow-sm"
        >
          <div className="font-bold text-lg mb-0.5">Build my full profile</div>
          <div className="text-rose-200 text-sm">10 questions → personality badge → date code</div>
        </button>

        {/* Path B */}
        <button
          onClick={() => navigate('/guest')}
          className="w-full bg-white hover:bg-rose-50 text-gray-800 border border-rose-100 rounded-2xl p-5 text-left transition-colors shadow-sm"
        >
          <div className="font-bold text-lg mb-0.5">Quick guest session</div>
          <div className="text-gray-400 text-sm">5 questions → 2 date ideas → no account needed</div>
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
