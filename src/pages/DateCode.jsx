import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function DateCode() {
  const { code } = useParams()
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-8 text-center">
        <div className="text-5xl mb-4">✨</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Your date code is ready!</h1>
        <p className="text-gray-500 text-sm mb-6">Share this code with your match so they can enter it on their end.</p>

        <div className="bg-rose-50 border-2 border-rose-200 rounded-xl px-6 py-5 mb-4">
          <span className="text-4xl font-mono font-bold tracking-[0.25em] text-rose-500">
            {code}
          </span>
        </div>

        <button
          onClick={handleCopy}
          className="w-full border border-rose-200 text-rose-500 hover:bg-rose-50 font-medium py-2 rounded-xl text-sm transition-colors mb-3"
        >
          {copied ? 'Copied!' : 'Copy code'}
        </button>

        <button
          onClick={() => navigate(`/match/${code}`)}
          className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
        >
          Enter my match's code →
        </button>
      </div>
    </div>
  )
}
