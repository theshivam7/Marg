import { AlertTriangle, ChevronRight, CircleAlert, Info, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatDateTime } from '../utils/traffic.js'

const severityConfig = {
  critical: { label: 'Critical', icon: CircleAlert, badge: 'bg-[#fde9e9] text-[#c74242]', iconClass: 'bg-[#fff0f0] text-[#d85353]', edge: 'border-l-[#d85353]' },
  warning: { label: 'Warning', icon: AlertTriangle, badge: 'bg-[#fff3da] text-[#aa6b0b]', iconClass: 'bg-[#fff6e3] text-[#c68017]', edge: 'border-l-[#d59124]' },
  info: { label: 'Info', icon: Info, badge: 'bg-[#e3f5f1] text-[#0d8578]', iconClass: 'bg-[#e8f7f4] text-[#0f9f8f]', edge: 'border-l-[#0f9f8f]' },
}

export default function AlertCard({ alert, compact = false }) {
  const config = severityConfig[alert.severity]
  const Icon = config.icon
  const isPlate = /^KA\d{2}[A-Z]{2}\d{4}$/.test(alert.subject)
  const target = isPlate ? `/tracker?plate=${alert.subject}` : `/map?camera=${alert.cameraId}`
  return (
    <article className={`rounded-[14px] border border-[#e3e8ef] border-l-[3px] bg-white transition-shadow hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)] ${config.edge} ${compact ? 'p-4' : 'p-5'}`}>
      <div className="flex items-start gap-3.5">
        <span className={`mt-0.5 rounded-xl p-2.5 ${config.iconClass}`}><Icon size={18} /></span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-[#202c40]">{alert.type}</p>
              <p className="mt-0.5 text-sm font-medium text-[#46556b]">{alert.subject}</p>
            </div>
            <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] ${config.badge}`}>{config.label}</span>
          </div>
          <p className="mt-2 text-xs leading-5 text-[#6b778c]">{alert.message}</p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[10px] font-medium text-[#8995a8]">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span>{formatDateTime(alert.timestamp)}</span>
              <span className="flex items-center gap-1"><MapPin size={11} /> {alert.cameraId}</span>
            </div>
            <Link to={target} className="flex items-center gap-1 font-semibold text-[#2563eb] hover:text-[#1d4ed8]">
              {isPlate ? 'Track vehicle' : 'Open camera'}<ChevronRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}
