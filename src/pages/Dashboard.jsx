import { useMemo } from 'react'
import { AlertTriangle, Camera, CarFront, Gauge, Route } from 'lucide-react'
import { Area, AreaChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Link } from 'react-router-dom'
import cameras from '../data/cameras.json'
import detections from '../data/detections.json'
import roadSegments from '../data/roadSegments.json'
import trafficStats from '../data/trafficStats.json'
import alerts from '../data/alerts.json'
import { usePeriod } from '../PeriodContext.jsx'
import { distributionFromDetections, filterByPeriod, getKpis, periodHours, trafficColor, trafficLabel } from '../utils/traffic.js'
import PageHeader from '../components/PageHeader.jsx'
import PeriodFilter from '../components/PeriodFilter.jsx'
import DataNotice from '../components/DataNotice.jsx'
import StatCard from '../components/StatCard.jsx'
import TrafficMap from '../components/TrafficMap.jsx'
import ChartCard from '../components/ChartCard.jsx'
import AlertCard from '../components/AlertCard.jsx'
import QuickVehicleSearch from '../components/QuickVehicleSearch.jsx'

const pieColors = ['#2563eb', '#0f9f8f', '#d59124', '#64748b', '#7c5ce7', '#3b82c4', '#d26882', '#4f7d6c']
const axis = { fontSize: 10, fill: '#8290a3' }

export default function Dashboard() {
  const { period } = usePeriod()
  const filteredDetections = useMemo(() => filterByPeriod(detections, period), [period])
  const kpis = useMemo(() => getKpis(detections, cameras, roadSegments, alerts, period), [period])
  const volumeData = useMemo(() => trafficStats.hourlyVolume.filter((item) => periodHours(item.hour, period)), [period])
  const distribution = useMemo(() => distributionFromDetections(filteredDetections), [filteredDetections])
  const recentAlerts = useMemo(() => filterByPeriod(alerts, period).slice().sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 4), [period])
  const topCorridors = useMemo(() => trafficStats.corridors
    .map((corridor) => ({ ...corridor, volume: corridor.volumeByPeriod[period] }))
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 5), [period])

  const stats = [
    { label: 'Unique vehicles', value: kpis.vehicles.toLocaleString('en-IN'), change: '+12.4%', icon: CarFront, tone: 'accent' },
    { label: 'Camera availability', value: kpis.activeCameras, suffix: `/ ${cameras.length}`, icon: Camera, tone: 'green' },
    { label: 'Network average speed', value: kpis.averageSpeed, suffix: 'km/h', change: '-6.8%', icon: Gauge, tone: 'amber' },
    { label: 'Critical corridors', value: kpis.congestedSegments, icon: Route, tone: 'red' },
    { label: 'Open incidents', value: kpis.alerts, icon: AlertTriangle, tone: 'neutral' },
  ]

  return (
    <div>
      <PageHeader
        eyebrow="Bengaluru · Operations overview"
        title="City Traffic Intelligence"
        description="Monitor camera coverage, trace vehicle movement and identify pressure points across Bengaluru's connected road network."
        actions={<PeriodFilter />}
      />

      <div className="mb-5"><DataNotice /></div>

      <section className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-5" aria-label="Traffic summary">
        {stats.map((stat, index) => <StatCard key={stat.label} {...stat} className={index === stats.length - 1 ? 'col-span-2 xl:col-span-1' : ''} />)}
      </section>

      <QuickVehicleSearch />

      <section className="mb-6 grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.75fr)]">
        <div className="panel p-3 sm:p-4">
          <div className="mb-3 flex items-center justify-between px-1 sm:px-2">
            <div>
              <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#0f9f8f] shadow-[0_0_0_4px_rgba(15,159,143,0.1)]" /><h2 className="text-[15px] font-semibold tracking-[-0.02em]">Live network view</h2></div>
              <p className="mt-1.5 text-[11px] text-[#748096]">{cameras.length} camera sites across south-east and central Bengaluru</p>
            </div>
            <Link to="/map" className="text-xs font-semibold text-[#2563eb] hover:text-[#1d4ed8]">Open full map</Link>
          </div>
          <TrafficMap period={period} detections={filteredDetections} height="470px" />
        </div>

        <ChartCard title="Traffic volume" description="Vehicle detections by hour · IST">
          <div className="h-[390px] xl:h-[430px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                <defs><linearGradient id="volumeFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2563eb" stopOpacity={0.22} /><stop offset="95%" stopColor="#2563eb" stopOpacity={0.01} /></linearGradient></defs>
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={axis} interval={Math.max(0, Math.floor(volumeData.length / 6) - 1)} />
                <YAxis axisLine={false} tickLine={false} tick={axis} />
                <Tooltip formatter={(value) => [Number(value).toLocaleString('en-IN'), 'Vehicles']} />
                <Area type="monotone" dataKey="weekday" stroke="#2563eb" strokeWidth={2.6} fill="url(#volumeFill)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex items-center justify-between rounded-xl border border-[#e7ebf1] bg-[#f7f9fc] px-3 py-2 text-[11px] text-[#718096]"><span>Peak window</span><strong className="font-semibold text-[#273449]">17:00–20:00</strong></div>
        </ChartCard>
      </section>

      <section className="grid gap-5 lg:grid-cols-2 xl:grid-cols-[0.75fr_1fr_1.15fr]">
        <ChartCard title="Vehicle distribution" description="Share of detection events">
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart><Pie data={distribution} dataKey="value" nameKey="name" innerRadius={52} outerRadius={78} paddingAngle={2} stroke="none" isAnimationActive={false}>{distribution.map((entry, index) => <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />)}</Pie><Tooltip formatter={(value) => [Number(value).toLocaleString('en-IN'), 'Detections']} /></PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {distribution.slice(0, 6).map((item, index) => <div key={item.name} className="flex items-center gap-2 text-[11px] text-[#657188]"><span className="h-2 w-2 rounded-full" style={{ background: pieColors[index] }} />{item.name}</div>)}
          </div>
        </ChartCard>

        <ChartCard title="Priority corridors" description="Ranked by selected-period volume">
          <div className="space-y-4">
            {topCorridors.map((corridor, index) => {
              const level = corridor.averageSpeed < 22 ? 'heavy' : corridor.averageSpeed < 27 ? 'moderate' : 'normal'
              const max = topCorridors[0]?.volume || 1
              return (
                <div key={corridor.name}>
                  <div className="mb-1.5 flex items-center justify-between gap-3 text-xs"><span className="font-medium text-[#344054]">{index + 1}. {corridor.name}</span><span className="text-[#8290a3]">{corridor.volume.toLocaleString('en-IN')}</span></div>
                  <div className="h-1.5 rounded-full bg-[#edf1f5]"><div className="h-full rounded-full" style={{ width: `${(corridor.volume / max) * 100}%`, background: trafficColor(level) }} /></div>
                  <p className="mt-1 text-[10px]" style={{ color: trafficColor(level) }}>{trafficLabel(level)} · {corridor.averageSpeed} km/h</p>
                </div>
              )
            })}
          </div>
        </ChartCard>

        <ChartCard title="Recent alerts" description="Latest operational events" action={<Link to="/alerts" className="text-xs font-semibold text-[#2563eb]">View all</Link>} className="lg:col-span-2 xl:col-span-1">
          <div className="space-y-3">{recentAlerts.map((alert) => <AlertCard key={alert.alertId} alert={alert} compact />)}</div>
        </ChartCard>
      </section>
    </div>
  )
}
