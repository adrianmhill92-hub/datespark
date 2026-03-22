const BADGE_META = {
  'The Adventurer':      { emoji: '🌟', bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-700' },
  'The Romantic':        { emoji: '💕', bg: 'bg-pink-50',    border: 'border-pink-200',    text: 'text-pink-700' },
  'The Foodie':          { emoji: '🍽️', bg: 'bg-orange-50',  border: 'border-orange-200',  text: 'text-orange-700' },
  'The Culture Vulture': { emoji: '🎭', bg: 'bg-purple-50',  border: 'border-purple-200',  text: 'text-purple-700' },
  'The Nester':          { emoji: '🏡', bg: 'bg-green-50',   border: 'border-green-200',   text: 'text-green-700' },
  'The Wildcard':        { emoji: '⚡', bg: 'bg-indigo-50',  border: 'border-indigo-200',  text: 'text-indigo-700' },
}

export default function PersonalityBadge({ badge, summary }) {
  const meta = BADGE_META[badge] ?? { emoji: '✨', bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700' }

  return (
    <div className={`${meta.bg} border-2 ${meta.border} rounded-2xl p-6 text-center`}>
      <div className="text-5xl mb-3">{meta.emoji}</div>
      <h2 className={`text-2xl font-bold ${meta.text} mb-3`}>{badge}</h2>
      {summary && <p className="text-gray-600 text-sm leading-relaxed">{summary}</p>}
    </div>
  )
}
