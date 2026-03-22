import { useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useProfile } from '../hooks/useProfile'
import { useSuggestions } from '../hooks/useSuggestions'
import SuggestionCard from '../components/SuggestionCard'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Results() {
  const { codeA, codeB } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const timing = {
    date: searchParams.get('date'),
    startTime: searchParams.get('start'),
    endTime: searchParams.get('end'),
  }

  const { profile: profileA, loading: loadingA, error: errorA } = useProfile(codeA)
  const { profile: profileB, loading: loadingB, error: errorB } = useProfile(codeB)
  const { suggestions, loading: loadingSuggestions, error: suggError, fetch } = useSuggestions()

  useEffect(() => {
    if (profileA && profileB) {
      fetch(profileA, profileB, timing)
    }
  }, [profileA, profileB]) // eslint-disable-line react-hooks/exhaustive-deps

  const isLoading = loadingA || loadingB || loadingSuggestions
  const error = errorA || errorB || suggError

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 p-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center pt-8 pb-6">
          <h1 className="text-3xl font-bold text-rose-500">DateSpark ✨</h1>
          {profileA && profileB && (
            <p className="text-gray-500 text-sm mt-1">
              Ideas for {profileA.name} &amp; {profileB.name}
            </p>
          )}
        </div>

        {isLoading && (
          <div className="flex flex-col items-center gap-3 py-16">
            <LoadingSpinner />
            <p className="text-gray-500 text-sm">
              {loadingA || loadingB ? 'Loading profiles…' : 'Sparking ideas with AI…'}
            </p>
          </div>
        )}

        {error && (
          <div className="bg-white rounded-2xl shadow p-6 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="text-rose-500 underline text-sm"
            >
              Start over
            </button>
          </div>
        )}

        {!isLoading && !error && suggestions.length > 0 && (
          <div className="space-y-4 pb-8">
            {suggestions.map((suggestion, index) => (
              <SuggestionCard key={index} suggestion={suggestion} rank={index + 1} city={profileA?.city} />
            ))}
            <button
              onClick={() => navigate('/')}
              className="w-full text-center text-gray-400 text-sm py-2 hover:text-rose-500 transition-colors"
            >
              Create a new profile →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
