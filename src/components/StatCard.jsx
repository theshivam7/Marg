import { ArrowDownRight, ArrowUpRight } from 'lucide-react'

export default function StatCard({ label, value, suffix, change, detail, icon: Icon, tone = 'accent' }) {
  const tones = {
    accent: 'bg-blue-50 text-blue-600 group-hover:bg-blue-100 group-hover:scale-105',
    green: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 group-hover:scale-105',
    amber: 'bg-amber-50 text-amber-600 group-hover:bg-amber-100 group-hover:scale-105',
    red: 'bg-rose-50 text-rose-600 group-hover:bg-rose-100 group-hover:scale-105',
    neutral: 'bg-slate-100 text-slate-600 group-hover:bg-slate-200 group-hover:scale-105',
  }

  const positive = change?.startsWith('+')

  return (
    <article className="panel panel-hover p-4 sm:p-5 flex flex-col justify-between group cursor-default">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500 truncate">{label}</p>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 transition-colors">
              {value}
            </span>
            {suffix && (
              <span className="text-xs font-medium text-slate-400">
                {suffix}
              </span>
            )}
          </div>
        </div>
        <span className={`rounded-2xl p-2.5 shrink-0 transition-all duration-200 ${tones[tone] || tones.accent}`}>
          <Icon size={18} strokeWidth={2} />
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
        {change ? (
          <div className="flex items-center gap-1">
            {positive ? (
              <span className="flex items-center text-emerald-600 font-semibold">
                <ArrowUpRight size={13} /> {change}
              </span>
            ) : (
              <span className="flex items-center text-rose-600 font-semibold">
                <ArrowDownRight size={13} /> {change}
              </span>
            )}
            <span className="text-slate-400">vs benchmark</span>
          </div>
        ) : (
          <span className="text-slate-400 truncate">{detail}</span>
        )}
      </div>
    </article>
  )
}
