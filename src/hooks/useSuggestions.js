import { useState } from 'react'
import { getDateSuggestions } from '../lib/claude'
import { fetchLocalEvents } from '../lib/ticketmaster'

export function useSuggestions() {
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function fetch(profileA, profileB, timing) {
    setLoading(true)
    setError(null)
    setSuggestions([])
    try {
      // Fetch Ticketmaster events first — fails silently, never blocks Claude
      const events = await fetchLocalEvents(profileA, timing).catch(() => [])
      const results = await getDateSuggestions(profileA, profileB, timing, events)
      setSuggestions(results)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { suggestions, loading, error, fetch }
}
