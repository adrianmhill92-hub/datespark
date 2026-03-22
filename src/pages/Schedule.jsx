import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function computeDuration(start, end) {
  if (!start || !end) return null
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  const mins = (eh * 60 + em) - (sh * 60 + sm)
  if (mins <= 0) return null
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h === 0) return `${m}m available`
  if (m === 0) return `${h}h available`
  return `${h}h ${m}m available`
}

export default function Schedule() {
  const { codeA, codeB } = useParams()
  const navigate = useNavigate()

  const [date, setDate] = useState(todayISO())
  const [startTime, setStartTime] = useState('19:00')
  const [endTime, setEndTime] = useState('22:00')
  const [error, setError] = useState(null)

  const duration = computeDuration(startTime, endTime)

  function handleSubmit(e) {
    e.preventDefault()
    if (!duration) {
      setError('End time must be after start time.')
      return
    }
    navigate(
      `/results/${codeA}/${codeB}?date=${date}&start=${startTime}&end=${endTime}`
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-8">
        <div className="text-4xl mb-4 text-center">🗓️</div>
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-1">
          When's the date?
        </h1>
        <p className="text-gray-500 text-sm text-center mb-7">
          We'll tailor suggestions to your day, time, and how long you have.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={date}
              min={todayISO()}
              onChange={e => setDate(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
            />
          </div>

          {/* Start + End time */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Start time</label>
              <input
                type="time"
                value={startTime}
                onChange={e => { setStartTime(e.target.value); setError(null) }}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">End time</label>
              <input
                type="time"
                value={endTime}
                onChange={e => { setEndTime(e.target.value); setError(null) }}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
            </div>
          </div>

          {/* Duration badge */}
          {duration && !error && (
            <div className="text-center">
              <span className="inline-block bg-rose-50 text-rose-500 text-sm font-medium px-4 py-1.5 rounded-full border border-rose-100">
                {duration}
              </span>
            </div>
          )}

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-2.5 rounded-xl transition-colors"
          >
            See our date ideas →
          </button>
        </form>
      </div>
    </div>
  )
}
