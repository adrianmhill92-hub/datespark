import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function EnterCode() {
  const navigate = useNavigate()
  const [code, setCode] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = code.trim().toUpperCase()
    if (!trimmed) return
    navigate(`/match/${trimmed}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-rose-500">DateSpark ✨</h1>
          <p className="text-gray-500 text-sm mt-2">Enter your date code to get started.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date code</label>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="e.g. SPARK42"
              maxLength={20}
              autoCapitalize="characters"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-rose-300"
            />
          </div>

          <button
            type="submit"
            disabled={!code.trim()}
            className="w-full bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white font-semibold py-2.5 rounded-xl transition-colors"
          >
            Continue →
          </button>
        </form>

        <button
          onClick={() => navigate('/')}
          className="w-full text-center text-xs text-gray-400 hover:text-rose-500 transition-colors mt-4"
        >
          ← Back to home
        </button>
      </div>
    </div>
  )
}
