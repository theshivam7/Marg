import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  CircleAlert,
  Info,
  Search,
  ShieldCheck,
  X,
} from 'lucide-react'
import alerts from '../data/alerts.json'
import { usePeriod } from '../PeriodContext.jsx'
import { filterByPeriod } from '../utils/traffic.js'
import PageHeader from '../components/PageHeader.jsx'
import AlertCard from '../components/AlertCard.jsx'

export default function Alerts() {
  const { period } = usePeriod()
  const [severity, setSeverity] = useState('all')
  const [query, setQuery] = useState('')
  const [visibleCount, setVisibleCount] = useState(8)

  const periodAlerts = useMemo(() => filterByPeriod(alerts, period), [period])

  const filtered = useMemo(() => {
    return periodAlerts
      .filter((alert) => severity === 'all' || alert.severity === severity)
      .filter((alert) =>
        `${alert.type} ${alert.subject} ${alert.message} ${alert.cameraId}`
          .toLowerCase()
          .includes(query.toLowerCase())
      )
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
  }, [periodAlerts, severity, query])

  const counts = {
    critical: periodAlerts.filter((a) => a.severity === 'critical').length,
    warning: periodAlerts.filter((a) => a.severity === 'warning').length,
    info: periodAlerts.filter((a) => a.severity === 'info').length,
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Network Awareness"
        title="Alerts Center"
        description="Monitor automated watchlist sightings, corridor congestion, plate anomalies and camera health events."
      />

      {/* Severity Metric Cards */}
      <section className="grid grid-cols-3 gap-3 sm:gap-4" aria-label="Alert Counts">
        {[
          {
            label: 'Critical',
            key: 'critical',
            count: counts.critical,
            icon: CircleAlert,
            tone: 'bg-rose-50 text-rose-600',
            activeStyle: {
              borderColor: 'rgba(251, 113, 133, 0.55)',
              background: 'rgba(255, 241, 242, 0.72)',
              boxShadow: '0 0 0 3px rgba(244, 63, 94, 0.1), 0 8px 24px rgba(15, 23, 42, 0.05)',
            },
          },
          {
            label: 'Warning',
            key: 'warning',
            count: counts.warning,
            icon: AlertTriangle,
            tone: 'bg-amber-50 text-amber-600',
            activeStyle: {
              borderColor: 'rgba(251, 191, 36, 0.6)',
              background: 'rgba(255, 251, 235, 0.78)',
              boxShadow: '0 0 0 3px rgba(245, 158, 11, 0.1), 0 8px 24px rgba(15, 23, 42, 0.05)',
            },
          },
          {
            label: 'Information',
            key: 'info',
            count: counts.info,
            icon: Info,
            tone: 'bg-slate-100 text-slate-600',
            activeStyle: {
              borderColor: 'rgba(148, 163, 184, 0.62)',
              background: 'rgba(248, 250, 252, 0.86)',
              boxShadow: '0 0 0 3px rgba(100, 116, 139, 0.1), 0 8px 24px rgba(15, 23, 42, 0.05)',
            },
          },
        ].map(({ label, key, count, icon: Icon, tone, activeStyle }) => {
          const isActive = severity === key
          return (
            <button
              type="button"
              key={label}
              onClick={() => {
                setSeverity(isActive ? 'all' : key)
                setVisibleCount(8)
              }}
              aria-pressed={isActive}
              style={isActive ? activeStyle : undefined}
              className="panel panel-hover flex items-center justify-between p-4 text-left sm:p-5"
            >
              <div>
                <p className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  {count}
                </p>
                <p className="mt-0.5 text-xs font-medium text-slate-500">
                  {label}
                </p>
              </div>
              <span className={`rounded-2xl p-2.5 transition-transform duration-200 ${isActive ? 'scale-110' : ''} ${tone}`}>
                <Icon size={20} strokeWidth={2} />
              </span>
            </button>
          )
        })}
      </section>

      {/* Search & Severity Filters */}
      <section className="panel p-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setVisibleCount(8)
            }}
            placeholder="Search plate (e.g. KA03MN4582), camera ID, or keyword..."
            className="w-full rounded-xl border border-slate-200/90 bg-slate-100/80 py-2 pl-9 pr-9 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
            aria-label="Search alerts"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('')
                setVisibleCount(8)
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-500 transition-colors hover:bg-white hover:text-slate-900"
              aria-label="Clear alert search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="glass-segmented inline-flex max-w-full items-center overflow-x-auto no-scrollbar rounded-xl p-0.5">
          {['all', 'critical', 'warning', 'info'].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setSeverity(item)
                setVisibleCount(8)
              }}
              aria-pressed={severity === item}
              className={`rounded-lg px-3 py-1 text-xs font-medium capitalize transition-all ${
                severity === item
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      {/* Alerts Grid */}
      <section className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <p>
            Showing <strong className="text-slate-700 font-semibold">{Math.min(visibleCount, filtered.length)}</strong> of{' '}
            <strong className="text-slate-700 font-semibold">{filtered.length}</strong> alerts
          </p>
          <span>Newest first</span>
        </div>

        {filtered.length ? (
          <div className="grid gap-3.5 md:grid-cols-2">
            {filtered.slice(0, visibleCount).map((alert) => (
              <AlertCard key={alert.alertId} alert={alert} />
            ))}
          </div>
        ) : (
          <div className="panel p-12 text-center">
            <ShieldCheck size={28} className="mx-auto text-slate-300" />
            <p className="mt-3 text-sm font-semibold text-slate-700">No alerts match these filters</p>
            <p className="mt-1 text-xs text-slate-400">
              Try choosing another timeframe, severity, or search query.
            </p>
          </div>
        )}

        {filtered.length > 8 && (
          <div className="flex justify-center pt-1">
            <button
              type="button"
              onClick={() => setVisibleCount((count) => (count >= filtered.length ? 8 : filtered.length))}
              className="btn-secondary min-w-32"
            >
              {visibleCount >= filtered.length ? 'Show fewer' : `Show ${filtered.length - visibleCount} more`}
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
