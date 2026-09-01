import { usePeriod } from '../PeriodContext.jsx'
import { PERIODS } from '../utils/traffic.js'

export default function PeriodFilter() {
  const { period, setPeriod } = usePeriod()
  return (
    <div className="grid w-full grid-cols-3 gap-1 rounded-xl border border-[#dfe5ed] bg-[#eaf0f7] p-1 sm:flex sm:w-auto" aria-label="Traffic period">
      {PERIODS.map((item) => (
        <button
          key={item.id}
          type="button"
          title={item.description}
          onClick={() => setPeriod(item.id)}
          className={`whitespace-nowrap rounded-lg px-2.5 py-2 text-[11px] font-medium transition-colors sm:px-3 sm:text-xs ${period === item.id ? 'bg-white text-[#1d4ed8] shadow-sm' : 'text-[#68758a] hover:text-[#172033]'}`}
          aria-pressed={period === item.id}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}
