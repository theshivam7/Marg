import { usePeriod } from '../PeriodContext.jsx'
import { PERIODS } from '../utils/traffic.js'

export default function PeriodFilter() {
  const { period, setPeriod } = usePeriod()

  return (
    <div
      className="glass-segmented inline-flex w-full max-w-full items-center overflow-x-auto no-scrollbar rounded-xl p-0.5 text-xs md:w-auto"
      role="group"
      aria-label="Traffic timeframe"
    >
      {PERIODS.map((item) => {
        const isActive = period === item.id
        return (
          <button
            key={item.id}
            type="button"
            title={item.description}
            onClick={() => setPeriod(item.id)}
            className={`period-pill min-w-fit flex-1 whitespace-nowrap rounded-lg px-2.5 py-1 text-[11px] font-medium sm:px-3 sm:text-xs md:flex-none ${
              isActive
                ? 'period-pill-active text-[#0066cc] font-semibold'
                : 'text-slate-600 hover:-translate-y-px hover:bg-white/60 hover:text-slate-900 active:translate-y-0 active:scale-[0.98]'
            }`}
            aria-pressed={isActive}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
