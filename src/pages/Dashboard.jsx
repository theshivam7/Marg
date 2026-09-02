import { useMemo, useState } from 'react'
import { Camera, CarFront, ChevronRight, Gauge, Route } from 'lucide-react'
import { Link } from 'react-router-dom'
import cameras from '../data/cameras.json'
import detections from '../data/detections.json'
import roadSegments from '../data/roadSegments.json'
import alerts from '../data/alerts.json'
import { usePeriod } from '../PeriodContext.jsx'
import { filterByPeriod, getKpis } from '../utils/traffic.js'
import PageHeader from '../components/PageHeader.jsx'
import StatCard from '../components/StatCard.jsx'
import TrafficMap from '../components/TrafficMap.jsx'
import AlertCard from '../components/AlertCard.jsx'
import QuickVehicleSearch from '../components/QuickVehicleSearch.jsx'

export default function Dashboard() {
  const { period } = usePeriod()
  const [focusedAlert, setFocusedAlert] = useState(null)

  const filteredDetections = useMemo(() => filterByPeriod(detections, period), [period])
  const kpis = useMemo(() => getKpis(detections, cameras, roadSegments, alerts, period), [period])

  const periodAlerts = useMemo(
    () =>
      filterByPeriod(alerts, period)
        .slice()
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
    [period]
  )

  const stats = [
    {
      label: 'Vehicles Detected',
      value: kpis.vehicles.toLocaleString('en-IN'),
      detail: `${filteredDetections.length.toLocaleString('en-IN')} camera sightings`,
      icon: CarFront,
      tone: 'accent',
    },
    {
      label: 'Cameras Online',
      value: kpis.activeCameras,
      suffix: `/ ${cameras.length}`,
      detail: `${cameras.length - kpis.activeCameras} offline or maintenance`,
      icon: Camera,
      tone: 'green',
    },
    {
      label: 'Average Speed',
      value: kpis.averageSpeed,
      suffix: 'km/h',
      detail: `Across ${kpis.activeCameras} online cameras`,
      icon: Gauge,
      tone: 'amber',
    },
    {
      label: 'Congested Corridors',
      value: kpis.congestedSegments,
      detail: `${Math.round((kpis.congestedSegments / roadSegments.length) * 100)}% of monitored network`,
      icon: Route,
      tone: 'red',
    },
  ]

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow="Bengaluru Operations Overview"
        title="Traffic Intelligence Overview"
        description="Monitor traffic density, corridor pressure and vehicle movement across connected city junctions."
      />

      {/* KPI Stats Row */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4" aria-label="System Metrics">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      {/* Quick Search */}
      <QuickVehicleSearch />

      {/* Main Grid: Map & Recent Alerts */}
      <section className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* Map Panel */}
        <div className="panel p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-4 px-1">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                City Traffic Density
              </h2>
              <p className="text-xs text-slate-500">
                Corridor conditions across 25 Bengaluru camera nodes
              </p>
            </div>
            <Link
              to="/map"
              className="flex items-center gap-1 text-xs font-semibold text-[#0071e3] hover:text-[#0058b0] group transition-colors"
            >
              Explore Map <ChevronRight size={13} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <TrafficMap
            period={period}
            detections={filteredDetections}
            height="clamp(420px, calc(100vh - 280px), 620px)"
            className="overview-map-canvas"
            showCameras={false}
            showAreaLabels
            focusCameraId={focusedAlert?.cameraId}
          />
        </div>

        {/* Right Card: Recent Alerts */}
        <div className="panel p-4 sm:p-5 flex flex-col">
          <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Recent Alerts
              </h2>
              <p className="text-xs text-slate-500">
                {periodAlerts.length} priority incidents
              </p>
            </div>

            <Link
              to="/alerts"
              className="text-xs font-semibold text-[#0071e3] hover:text-[#0058b0] hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[500px] pr-0.5">
            {periodAlerts.length > 0 ? (
              periodAlerts.slice(0, 4).map((alert) => (
                <AlertCard
                  key={alert.alertId}
                  alert={alert}
                  compact
                  selected={focusedAlert?.alertId === alert.alertId}
                  onSelect={() => setFocusedAlert(alert)}
                />
              ))
            ) : (
              <p className="rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-8 text-center text-xs text-slate-400">
                No alerts recorded for this timeframe.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
