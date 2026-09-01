import { useMemo, useState } from 'react'
import { AlertTriangle, CircleAlert, Filter, Info, Search } from 'lucide-react'
import alerts from '../data/alerts.json'
import { usePeriod } from '../PeriodContext.jsx'
import { filterByPeriod } from '../utils/traffic.js'
import PageHeader from '../components/PageHeader.jsx'
import PeriodFilter from '../components/PeriodFilter.jsx'
import DataNotice from '../components/DataNotice.jsx'
import AlertCard from '../components/AlertCard.jsx'

const severities = ['all', 'critical', 'warning', 'info']
const types = ['All alert types', ...new Set(alerts.map((alert) => alert.type))]

export default function Alerts() {
  const { period } = usePeriod()
  const [severity, setSeverity] = useState('all')
  const [type, setType] = useState('All alert types')
  const [query, setQuery] = useState('')

  const periodAlerts = useMemo(() => filterByPeriod(alerts, period), [period])
  const filtered = useMemo(() => periodAlerts
    .filter((alert) => severity === 'all' || alert.severity === severity)
    .filter((alert) => type === 'All alert types' || alert.type === type)
    .filter((alert) => `${alert.type} ${alert.subject} ${alert.message} ${alert.cameraId}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp)), [periodAlerts, severity, type, query])

  const counts = {
    critical: periodAlerts.filter((alert) => alert.severity === 'critical').length,
    warning: periodAlerts.filter((alert) => alert.severity === 'warning').length,
    info: periodAlerts.filter((alert) => alert.severity === 'info').length,
  }

  return (
    <div>
      <PageHeader
        eyebrow="Operational awareness"
        title="Alerts"
        description="Triage watchlist matches, congestion, OCR anomalies, unusual movement and camera-health events."
        actions={<PeriodFilter />}
      />
      <div className="mb-5"><DataNotice compact /></div>

      <section className="mb-5 grid grid-cols-3 gap-3 sm:gap-4">
        {[
          ['Critical', counts.critical, CircleAlert, 'bg-[#fde9e9] text-[#c74242]'],
          ['Warning', counts.warning, AlertTriangle, 'bg-[#fff3da] text-[#aa6b0b]'],
          ['Information', counts.info, Info, 'bg-[#e3f5f1] text-[#0d8578]'],
        ].map(([label, value, Icon, className]) => (
          <article key={label} className="panel flex items-center gap-3 p-4 sm:p-5">
            <span className={`hidden rounded-xl p-2.5 sm:block ${className}`}><Icon size={19} /></span>
            <div><p className="text-2xl font-semibold tracking-[-0.04em]">{value}</p><p className="mt-0.5 text-[10px] font-medium text-[#748096] sm:text-xs">{label}</p></div>
          </article>
        ))}
      </section>

      <section className="panel mb-5 flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8996a9]" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search plate, camera, corridor or alert" className="w-full rounded-xl border border-[#dfe5ed] bg-[#f8fafc] py-2.5 pl-10 pr-3 text-xs text-[#344054] placeholder:text-[#9aa5b5]" aria-label="Search alerts" />
        </div>
        <div className="flex max-w-full gap-1 overflow-x-auto rounded-xl border border-[#dfe5ed] bg-[#eaf0f7] p-1">
          {severities.map((item) => (
            <button key={item} type="button" onClick={() => setSeverity(item)} className={`whitespace-nowrap rounded-lg px-3 py-2 text-[11px] font-medium capitalize ${severity === item ? 'bg-white text-[#1d4ed8] shadow-sm' : 'text-[#68758a]'}`}>{item}</button>
          ))}
        </div>
        <label className="relative">
          <Filter size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8290a3]" />
          <select value={type} onChange={(event) => setType(event.target.value)} className="w-full appearance-none rounded-xl border border-[#dfe5ed] bg-white py-2.5 pl-9 pr-8 text-[11px] text-[#526176] lg:w-52" aria-label="Alert type">
            {types.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-medium text-[#69758a]">Showing <strong className="font-semibold text-[#344054]">{filtered.length}</strong> alerts</p>
          <p className="text-[10px] text-[#8995a8]">Newest first</p>
        </div>
        {filtered.length ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {filtered.map((alert) => <AlertCard key={alert.alertId} alert={alert} />)}
          </div>
        ) : (
          <div className="panel p-12 text-center">
            <Info size={24} className="mx-auto text-[#8996a9]" />
            <p className="mt-3 text-sm font-semibold">No alerts match these filters</p>
            <p className="mt-1 text-xs text-[#748096]">Try another period, severity or search term.</p>
          </div>
        )}
      </section>
    </div>
  )
}
