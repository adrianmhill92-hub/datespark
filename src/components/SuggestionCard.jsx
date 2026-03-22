const RANK_COLORS = ['bg-rose-500', 'bg-pink-400', 'bg-orange-400']

export default function SuggestionCard({ suggestion, rank, city }) {
  const badgeColor = RANK_COLORS[rank - 1] ?? 'bg-gray-300'
  const isLiveEvent = suggestion.source === 'ticketmaster' && suggestion.url
  const actionUrl = isLiveEvent
    ? suggestion.url
    : `https://www.google.com/search?q=${encodeURIComponent(`${suggestion.title} ${city || ''} reservations`.trim())}`

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-rose-50 p-5">
      <div className="flex items-start gap-3">
        <div className={`${badgeColor} text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center shrink-0`}>
          {rank}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 flex-wrap">
            {isLiveEvent ? (
              <a
                href={suggestion.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-gray-800 text-base leading-tight hover:text-indigo-600 hover:underline transition-colors"
              >
                {suggestion.title}
              </a>
            ) : (
              <h3 className="font-semibold text-gray-800 text-base leading-tight">{suggestion.title}</h3>
            )}
            {isLiveEvent && (
              <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-2 py-0.5 rounded-full shrink-0">
                🎟 Live Event
              </span>
            )}
          </div>

          <p className="text-gray-500 text-sm mt-1 leading-snug">{suggestion.description}</p>

          <div className="flex flex-wrap gap-2 mt-3">
            {suggestion.budget && (
              <span className="bg-green-50 text-green-600 text-xs font-medium px-2 py-0.5 rounded-full">
                {suggestion.budget}
              </span>
            )}
            {suggestion.vibe && (
              <span className="bg-rose-50 text-rose-500 text-xs font-medium px-2 py-0.5 rounded-full">
                {suggestion.vibe}
              </span>
            )}
            {suggestion.duration && (
              <span className="bg-blue-50 text-blue-500 text-xs font-medium px-2 py-0.5 rounded-full">
                {suggestion.duration}
              </span>
            )}
          </div>

          {suggestion.why && (
            <p className="text-xs text-gray-400 mt-2 italic">"{suggestion.why}"</p>
          )}

          <a
            href={actionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-3 px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors bg-white text-rose-500 border-rose-300 hover:bg-rose-500 hover:text-white"
          >
            {isLiveEvent ? 'Get tickets →' : 'Reserve / Learn more →'}
          </a>
        </div>
      </div>
    </div>
  )
}
