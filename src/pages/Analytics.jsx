import { useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import detections from '../data/detections.json'
import trafficStats from '../data/trafficStats.json'
import { usePeriod } from '../PeriodContext.jsx'
import { distributionFromDetections, filterByPeriod, periodHours } from '../utils/traffic.js'
import PageHeader from '../components/PageHeader.jsx'
import ChartCard from '../components/ChartCard.jsx'

const appleColors = ['#0071e3', '#34c759', '#ff9500', '#5856d6', '#30b0c7', '#86868b']
const axis = { fontSize: 10, fill: '#86868b' }

export default function Analytics() {
  const { period } = usePeriod()
  const [activeTab, setActiveTab] = useState('flow')

  const periodDetections = useMemo(() => filterByPeriod(detections, period), [period])
  const hourly = useMemo(
    () => trafficStats.hourlyVolume.filter((item) => periodHours(item.hour, period)),
    [period]
  )
  const distribution = useMemo(() => distributionFromDetections(periodDetections), [periodDetections])
  const totalDetections = useMemo(
    () => distribution.reduce((sum, item) => sum + item.value, 0),
    [distribution]
  )

  const areas = useMemo(
    () =>
      trafficStats.areaStats
        .map((area) => ({ name: area.name, volume: area.volumeByPeriod[period] }))
        .sort((a, b) => b.volume - a.volume),
    [period]
  )

  const corridors = useMemo(
    () =>
      trafficStats.corridors
        .map((corridor) => ({
          name: corridor.name.replace(' → ', ' – '),
          volume: corridor.volumeByPeriod[period],
          speed: corridor.averageSpeed,
        }))
        .sort((a, b) => b.volume - a.volume),
    [period]
  )

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Pattern Intelligence"
        title="Traffic Analytics"
        description="Compare commuting peak hours, corridor demand, vehicle mix and velocity trends."
      />

      {/* Apple-style Segmented Navigation Tab Bar */}
      <div className="glass-segmented inline-flex max-w-full items-center overflow-x-auto no-scrollbar rounded-2xl p-1">
        {[
          { id: 'flow', label: 'Traffic Flow & Velocity' },
          { id: 'corridors', label: 'Corridors & Sectors' },
          { id: 'fleet', label: 'Vehicle Mix & Shifts' },
        ].map(({ id, label }) => {
          const isActive = activeTab === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              aria-pressed={isActive}
              className={`rounded-xl px-4 py-2 text-xs font-medium transition-all ${
                isActive
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {label}
            </button>
          )
        })}
      </div>

      {/* Tab 1: Traffic Flow & Velocity */}
      {activeTab === 'flow' && (
        <div className="grid gap-5 xl:grid-cols-2">
          <ChartCard
            title="Traffic Volume by Hour"
            description="Weekday vs weekend volume curves across Bengaluru"
          >
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="weekdayFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0071e3" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#0071e3" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="weekendFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#34c759" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#34c759" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={axis} />
                  <YAxis axisLine={false} tickLine={false} tick={axis} />
                  <Tooltip />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                  <Area
                    type="monotone"
                    dataKey="weekday"
                    name="Weekday"
                    stroke="#0071e3"
                    strokeWidth={2.5}
                    fill="url(#weekdayFill)"
                    isAnimationActive={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="weekend"
                    name="Weekend"
                    stroke="#34c759"
                    strokeWidth={2.5}
                    fill="url(#weekendFill)"
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard
            title="Average Corridor Velocity"
            description="Speed drops aligned with commuter rush hours"
          >
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hourly} margin={{ top: 10, right: 12, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={axis} />
                  <YAxis axisLine={false} tickLine={false} tick={axis} domain={[10, 50]} unit=" km/h" />
                  <Tooltip formatter={(value) => [`${value} km/h`, 'Average Speed']} />
                  <Line
                    type="monotone"
                    dataKey="averageSpeed"
                    stroke="#34c759"
                    strokeWidth={2.5}
                    dot={{ r: 2.5, fill: '#34c759' }}
                    activeDot={{ r: 5 }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      )}

      {/* Tab 2: Corridors & Sectors */}
      {activeTab === 'corridors' && (
        <div className="grid gap-5 xl:grid-cols-2">
          <ChartCard title="Busiest Corridors" description="Volume demand by road link">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={corridors} margin={{ top: 10, right: 10, left: -15, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ ...axis, angle: -25, textAnchor: 'end' }}
                    interval={0}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={axis} />
                  <Tooltip formatter={(value) => [Number(value).toLocaleString('en-IN'), 'Volume']} />
                  <Bar dataKey="volume" fill="#0071e3" radius={[6, 6, 0, 0]} barSize={22} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="Traffic by Sector" description="Volume density across focus areas">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={areas} layout="vertical" margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={axis} />
                  <YAxis type="category" dataKey="name" width={84} axisLine={false} tickLine={false} tick={axis} />
                  <Tooltip formatter={(value) => [Number(value).toLocaleString('en-IN'), 'Volume']} />
                  <Bar dataKey="volume" fill="#34c759" radius={[0, 6, 6, 0]} barSize={16} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      )}

      {/* Tab 3: Vehicle Mix & Shifts */}
      {activeTab === 'fleet' && (
        <div className="grid gap-5 xl:grid-cols-2">
          <ChartCard
            title="Vehicle Type Breakdown"
            description="Classification distribution for the selected timeframe"
          >
            <div className="grid min-h-80 items-center md:grid-cols-[1fr_0.9fr] gap-4">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distribution}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={3}
                      stroke="none"
                      isAnimationActive={false}
                    >
                      {distribution.map((item, index) => (
                        <Cell key={item.name} fill={appleColors[index % appleColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [Number(value).toLocaleString('en-IN'), 'Detections']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2">
                {distribution.map((item, index) => {
                  const pct = Math.round((item.value / Math.max(1, totalDetections)) * 100)
                  return (
                    <div
                      key={item.name}
                      className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/70 px-3.5 py-2 text-xs"
                    >
                      <div className="flex items-center gap-2 text-slate-700 font-medium">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ background: appleColors[index % appleColors.length] }}
                        />
                        <span>{item.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-slate-900">
                          {item.value.toLocaleString('en-IN')}
                        </span>
                        <span className="ml-1 text-[10px] text-slate-400">
                          ({pct}%)
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </ChartCard>

          <ChartCard
            title="Morning vs Evening Traffic"
            description="Commuter shifts between AM and PM peak periods"
          >
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trafficStats.morningVsEvening} margin={{ top: 10, right: 10, left: -15, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="area"
                    axisLine={false}
                    tickLine={false}
                    tick={{ ...axis, angle: -25, textAnchor: 'end' }}
                    interval={0}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={axis} />
                  <Tooltip />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="morning" name="Morning" fill="#93c5fd" radius={[6, 6, 0, 0]} isAnimationActive={false} />
                  <Bar dataKey="evening" name="Evening" fill="#0071e3" radius={[6, 6, 0, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      )}
    </div>
  )
}
