import { ArrowDownRight, ArrowUpRight } from 'lucide-react'

export default function StatCard({ label, value, suffix, change, icon: Icon, tone = 'accent', className = '' }) {
  const colors = {
    accent: 'bg-[#e8f0ff] text-[#2563eb]',
    green: 'bg-[#e2f5f0] text-[#0f8f80]',
    amber: 'bg-[#fff3da] text-[#b87712]',
    red: 'bg-[#fde9e9] text-[#cc4848]',
    neutral: 'bg-[#edf1f6] text-[#5f6d82]',
  }
  const positive = change?.startsWith('+')
  return (
    <article className={`panel p-4 sm:p-5 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium text-[#69758a]">{label}</p>
          <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[#172033] sm:text-3xl">
            {value}<span className="ml-1 text-sm font-medium text-[#78859a]">{suffix}</span>
          </p>
        </div>
        <span className={`rounded-xl p-2.5 ${colors[tone]}`}><Icon size={19} strokeWidth={1.8} /></span>
      </div>
      {change && (
        <div className="mt-3 flex items-center gap-1 text-[10px] text-[#7a879a]">
          {positive ? <ArrowUpRight size={13} className="text-[#0f9f8f]" /> : <ArrowDownRight size={13} className="text-[#d85353]" />}
          <span>{change} vs typical weekday</span>
        </div>
      )}
    </article>
  )
}
