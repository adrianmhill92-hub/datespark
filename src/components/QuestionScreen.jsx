/**
 * Reusable single-question screen with progress bar.
 *
 * Props:
 *   question  – string
 *   subtitle  – optional string
 *   options   – array of strings (for choice/multi types)
 *   type      – 'choice' | 'multi' | 'text' | 'slider'
 *   value     – current answer value
 *   onChange  – (value) => void
 *   onNext    – () => void
 *   onBack    – () => void | null (null hides back button)
 *   current   – 1-based step number
 *   total     – total steps
 */
export default function QuestionScreen({
  question,
  subtitle,
  options = [],
  type = 'choice',
  value,
  onChange,
  onNext,
  onBack,
  current,
  total,
}) {
  const progress = (current / total) * 100
  const canAdvance = type === 'text' ? value?.trim().length > 0
    : type === 'multi' ? value?.length > 0
    : type === 'slider' ? value !== undefined && value !== ''
    : !!value

  function handleChoice(opt) {
    onChange(opt)
    // auto-advance for single-choice
    setTimeout(() => onNext(), 180)
  }

  function handleMultiToggle(opt) {
    const current = Array.isArray(value) ? value : []
    onChange(
      current.includes(opt) ? current.filter(v => v !== opt) : [...current, opt]
    )
  }

  const SLIDER_LABELS = ['All talking', 'Mostly talking', 'Balanced', 'Mostly doing', 'All doing']

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-1 bg-rose-100">
        <div
          className="h-1 bg-rose-500 transition-all duration-400"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center justify-between px-5 py-4">
        {onBack ? (
          <button onClick={onBack} className="text-gray-400 hover:text-gray-600 transition-colors text-sm">
            ← Back
          </button>
        ) : <div />}
        <span className="text-xs text-gray-400">{current} / {total}</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-2 leading-snug">{question}</h2>
          {subtitle && <p className="text-gray-400 text-sm mb-6">{subtitle}</p>}

          {/* Choice */}
          {type === 'choice' && (
            <div className="space-y-3 mt-6">
              {options.map(opt => (
                <button
                  key={opt}
                  onClick={() => handleChoice(opt)}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                    value === opt
                      ? 'bg-rose-500 text-white border-rose-500'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-rose-300'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {/* Multi-select */}
          {type === 'multi' && (
            <>
              <div className="flex flex-wrap gap-2 mt-6">
                {options.map(opt => {
                  const selected = Array.isArray(value) && value.includes(opt)
                  return (
                    <button
                      key={opt}
                      onClick={() => handleMultiToggle(opt)}
                      className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                        selected
                          ? 'bg-rose-500 text-white border-rose-500'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-rose-300'
                      }`}
                    >
                      {opt}
                    </button>
                  )
                })}
              </div>
              <button
                onClick={onNext}
                disabled={!canAdvance}
                className="mt-6 w-full bg-rose-500 hover:bg-rose-600 disabled:bg-rose-200 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                Continue →
              </button>
            </>
          )}

          {/* Free text */}
          {type === 'text' && (
            <>
              <textarea
                value={value || ''}
                onChange={e => onChange(e.target.value)}
                placeholder="Type your answer…"
                rows={3}
                className="w-full mt-6 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none"
                autoFocus
              />
              <button
                onClick={onNext}
                disabled={!canAdvance}
                className="mt-4 w-full bg-rose-500 hover:bg-rose-600 disabled:bg-rose-200 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                Continue →
              </button>
            </>
          )}

          {/* Slider (talking vs doing) */}
          {type === 'slider' && (
            <>
              <div className="mt-8">
                <input
                  type="range"
                  min="0"
                  max="4"
                  step="1"
                  value={value ?? 2}
                  onChange={e => onChange(Number(e.target.value))}
                  className="w-full accent-rose-500"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                  {SLIDER_LABELS.map(l => <span key={l} className="text-center" style={{ width: '20%' }}>{l}</span>)}
                </div>
                <p className="text-center mt-3 text-rose-500 font-semibold text-sm">
                  {SLIDER_LABELS[value ?? 2]}
                </p>
              </div>
              <button
                onClick={onNext}
                className="mt-6 w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                Continue →
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
