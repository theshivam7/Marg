import { AlertTriangle, ChevronRight, CircleAlert, Info, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatDateTime } from '../utils/traffic.js'

const severityConfig = {
  critical: {
    label: 'Critical',
    icon: CircleAlert,
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
    iconBg: 'bg-rose-50 text-rose-600 group-hover:bg-rose-100',
  },
  warning: {
    label: 'Warning',
    icon: AlertTriangle,
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    iconBg: 'bg-amber-50 text-amber-600 group-hover:bg-amber-100',
  },
  info: {
    label: 'Info',
    icon: Info,
    badge: 'bg-slate-50 text-slate-700 border-slate-200',
    iconBg: 'bg-slate-100 text-slate-600 group-hover:bg-slate-200',
  },
}

export default function AlertCard({ alert, compact = false, onSelect, selected = false }) {
  const config = severityConfig[alert.severity] || severityConfig.info
  const Icon = config.icon
  const isPlate = /^KA\d{2}[A-Z]{2}\d{4}$/.test(alert.subject)
  const target = isPlate ? `/tracker?plate=${alert.subject}` : `/map?camera=${alert.cameraId}`

  const handleKeyDown = (event) => {
    if (!onSelect || (event.key !== 'Enter' && event.key !== ' ')) return
    event.preventDefault()
    onSelect()
  }

  return (
    <article
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      aria-pressed={onSelect ? selected : undefined}
      className={`panel panel-hover group transition-all duration-200 ${
        compact ? 'p-3.5' : 'p-4'
      } ${onSelect ? 'cursor-pointer hover:border-slate-300' : ''} ${
        selected ? 'ring-2 ring-blue-500/20 border-blue-500 shadow-md' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <span className={`mt-0.5 rounded-xl p-2 shrink-0 transition-colors duration-150 ${config.iconBg}`}>
          <Icon size={16} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-slate-900 truncate">
              {alert.type}
            </p>
            <span className={`rounded-full border px-2 py-0.2 text-[10px] font-semibold shrink-0 ${config.badge}`}>
              {config.label}
            </span>
          </div>

          <p className="mt-1 text-xs font-medium text-slate-700">
            {isPlate ? (
              <span className="plate-badge text-[10px] px-1.5 py-0.2 mr-1 group-hover:border-blue-400">
                {alert.subject}
              </span>
            ) : (
              alert.subject
            )}
          </p>

          <p className="mt-1 text-xs text-slate-500 leading-normal">
            {alert.message}
          </p>

          <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-slate-100 pt-2 text-[10px] text-slate-400">
            <div className="flex items-center gap-3">
              <span>{formatDateTime(alert.timestamp)}</span>
              <span className="flex items-center gap-1">
                <MapPin size={11} /> {alert.cameraId}
              </span>
            </div>

            {onSelect ? (
              <span className="flex items-center gap-0.5 font-semibold text-[#0071e3] group-hover:translate-x-0.5 transition-transform">
                Locate <ChevronRight size={12} />
              </span>
            ) : (
              <Link
                to={target}
                className="flex items-center gap-0.5 font-semibold text-[#0071e3] hover:text-[#0058b0] group-hover:translate-x-0.5 transition-transform"
              >
                {isPlate ? 'Track Vehicle' : 'Open Camera'} <ChevronRight size={12} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
