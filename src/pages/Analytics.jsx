import { useMemo } from 'react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import detections from '../data/detections.json'
import trafficStats from '../data/trafficStats.json'
import { usePeriod } from '../PeriodContext.jsx'
import { distributionFromDetections, filterByPeriod, periodHours } from '../utils/traffic.js'
import PageHeader from '../components/PageHeader.jsx'
import PeriodFilter from '../components/PeriodFilter.jsx'
import DataNotice from '../components/DataNotice.jsx'
import ChartCard from '../components/ChartCard.jsx'

const colors = ['#2563eb', '#0f9f8f', '#d59124', '#64748b', '#7c5ce7', '#3b82c4', '#d26882', '#4f7d6c']
const axis = { fontSize: 10, fill: '#8290a3' }

export default function Analytics() {
  const { period } = usePeriod()
  const periodDetections = useMemo(() => filterByPeriod(detections, period), [period])
  const hourly = useMemo(() => trafficStats.hourlyVolume.filter((item) => periodHours(item.hour, period)), [period])
  const distribution = useMemo(() => distributionFromDetections(periodDetections), [periodDetections])
  const areas = useMemo(() => trafficStats.areaStats.map((area) => ({ name: area.name, volume: area.volumeByPeriod[period] })).sort((a, b) => b.volume - a.volume), [period])
  const corridors = useMemo(() => trafficStats.corridors.map((corridor) => ({ name: corridor.name.replace(' → ', '–'), volume: corridor.volumeByPeriod[period], speed: corridor.averageSpeed })).sort((a, b) => b.volume - a.volume), [period])

  return (
    <div>
      <PageHeader
        eyebrow="Pattern intelligence"
        title="Traffic Analytics"
        description="Compare commuting peaks, vehicle mix, corridor demand and network speed across time."
        actions={<PeriodFilter />}
      />
      <div className="mb-5"><DataNotice compact /></div>

      <section className="grid gap-5 xl:grid-cols-2">
        <ChartCard title="Traffic Volume by Hour" description="Weekday and weekend mobility patterns">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourly} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="weekdayFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2563eb" stopOpacity={0.22} /><stop offset="95%" stopColor="#2563eb" stopOpacity={0.01} /></linearGradient>
                  <linearGradient id="weekendFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0f9f8f" stopOpacity={0.16} /><stop offset="95%" stopColor="#0f9f8f" stopOpacity={0.01} /></linearGradient>
                </defs>
                <CartesianGrid stroke="#e8edf3" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={axis} interval={Math.max(0, Math.floor(hourly.length / 7) - 1)} />
                <YAxis axisLine={false} tickLine={false} tick={axis} />
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="weekday" name="Weekday" stroke="#2563eb" strokeWidth={2.3} fill="url(#weekdayFill)" isAnimationActive={false} />
                <Area type="monotone" dataKey="weekend" name="Weekend" stroke="#0f9f8f" strokeWidth={2.1} fill="url(#weekendFill)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Average Speed by Hour" description="Lower speeds align with commuting peaks">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hourly} margin={{ top: 10, right: 12, left: -15, bottom: 0 }}>
                <CartesianGrid stroke="#e8edf3" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={axis} interval={Math.max(0, Math.floor(hourly.length / 7) - 1)} />
                <YAxis axisLine={false} tickLine={false} tick={axis} domain={[10, 50]} unit=" km/h" />
                <Tooltip formatter={(value) => [`${value} km/h`, 'Average speed']} />
                <Line type="monotone" dataKey="averageSpeed" stroke="#0f9f8f" strokeWidth={2.8} dot={{ r: 2.5, fill: '#0f9f8f' }} activeDot={{ r: 5 }} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Vehicle Type Distribution" description="Detection events for the selected period">
          <div className="grid min-h-80 items-center md:grid-cols-[1fr_0.8fr]">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={distribution} dataKey="value" nameKey="name" innerRadius={64} outerRadius={98} paddingAngle={2} stroke="none" isAnimationActive={false}>
                    {distribution.map((item, index) => <Cell key={item.name} fill={colors[index % colors.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value) => [Number(value).toLocaleString('en-IN'), 'Detections']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-1">
              {distribution.slice(0, 8).map((item, index) => (
                <div key={item.name} className="flex items-center justify-between gap-4 text-xs">
                  <span className="flex items-center gap-2 text-[#657188]"><span className="h-2.5 w-2.5 rounded-full" style={{ background: colors[index] }} />{item.name}</span>
                  <strong className="font-semibold text-[#344054]">{item.value.toLocaleString('en-IN')}</strong>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Traffic by Area" description="Vehicle volume across focus areas">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={areas} layout="vertical" margin={{ top: 4, right: 10, left: 20, bottom: 0 }}>
                <CartesianGrid stroke="#e8edf3" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={axis} />
                <YAxis type="category" dataKey="name" width={82} axisLine={false} tickLine={false} tick={axis} />
                <Tooltip formatter={(value) => [Number(value).toLocaleString('en-IN'), 'Volume']} />
                <Bar dataKey="volume" fill="#2563eb" radius={[0, 6, 6, 0]} barSize={18} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Most Used Corridors" description="Volume and average speed by route">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={corridors} margin={{ top: 4, right: 8, left: -15, bottom: 50 }}>
                <CartesianGrid stroke="#e8edf3" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ ...axis, angle: -30, textAnchor: 'end' }} interval={0} />
                <YAxis axisLine={false} tickLine={false} tick={axis} />
                <Tooltip formatter={(value) => [Number(value).toLocaleString('en-IN'), 'Volume']} />
                <Bar dataKey="volume" fill="#0f9f8f" radius={[6, 6, 0, 0]} barSize={28} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Morning vs Evening Traffic" description="Area-level comparison for a typical weekday">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trafficStats.morningVsEvening} margin={{ top: 4, right: 8, left: -15, bottom: 40 }}>
                <CartesianGrid stroke="#e8edf3" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="area" axisLine={false} tickLine={false} tick={{ ...axis, angle: -25, textAnchor: 'end' }} interval={0} />
                <YAxis axisLine={false} tickLine={false} tick={axis} />
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="morning" name="Morning" fill="#7aa7f8" radius={[5, 5, 0, 0]} isAnimationActive={false} />
                <Bar dataKey="evening" name="Evening" fill="#2563eb" radius={[5, 5, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Traffic Pattern Across Time" description="Seven-day volume and speed comparison" className="xl:col-span-2">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trafficStats.dailyTraffic} margin={{ top: 8, right: 14, left: -5, bottom: 0 }}>
                <CartesianGrid stroke="#e8edf3" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={axis} interval={1} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={axis} />
                <YAxis yAxisId="right" orientation="right" domain={[15, 40]} axisLine={false} tickLine={false} tick={axis} />
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                <Line yAxisId="left" type="monotone" dataKey="volume" name="Daily volume" stroke="#2563eb" strokeWidth={2.7} dot={{ r: 3 }} isAnimationActive={false} />
                <Line yAxisId="right" type="monotone" dataKey="averageSpeed" name="Average speed" stroke="#0f9f8f" strokeWidth={2.4} dot={{ r: 3 }} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </section>
    </div>
  )
}
