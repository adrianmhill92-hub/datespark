const TABS = [
  { id: 'home',      label: 'Home',      icon: '🏠' },
  { id: 'dates',     label: 'Dates',     icon: '✨' },
  { id: 'questions', label: 'Questions', icon: '💬' },
  { id: 'profile',   label: 'Profile',   icon: '👤' },
]

export default function BottomNav({ activeTab, onTabChange }) {
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 flex z-50 safe-area-pb">
      {TABS.map(t => (
        <button
          key={t.id}
          onClick={() => onTabChange(t.id)}
          className={`flex-1 py-3 flex flex-col items-center gap-0.5 text-xs font-medium transition-colors ${
            activeTab === t.id ? 'text-rose-500' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <span className="text-xl leading-none">{t.icon}</span>
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  )
}
