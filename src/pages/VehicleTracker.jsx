import { useEffect, useMemo, useState } from 'react'
import { Clock3, Gauge, MapPinned, Navigation, Pause, Play, RotateCcw, ScanText, Search, Shapes, ShieldAlert, Waypoints } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import cameras from '../data/cameras.json'
import vehicles from '../data/vehicles.json'
import detections from '../data/detections.json'
import { buildVehicleSummary, findVehicleByPlate, getVehicleDetections, normalizePlate } from '../utils/vehicleTracking.js'
import { formatDateTime, formatTime } from '../utils/traffic.js'
import PageHeader from '../components/PageHeader.jsx'
import DataNotice from '../components/DataNotice.jsx'
import TrafficMap from '../components/TrafficMap.jsx'

const cameraById = Object.fromEntries(cameras.map((camera) => [camera.cameraId, camera]))
const demoPlates = ['KA01AB1234', 'KA03MN4582', 'KA05TR9021', 'KA02CX7719', 'KA04QZ6118', 'KA09ZX4481', 'KA01MX4821']

export default function VehicleTracker() {
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedPlate = normalizePlate(searchParams.get('plate') ?? '')
  const requestedVehicle = requestedPlate ? findVehicleByPlate(vehicles, requestedPlate) : null
  const initialPlate = requestedVehicle?.plateNumber ?? 'KA01AB1234'
  const [query, setQuery] = useState(requestedPlate || initialPlate)
  const [plate, setPlate] = useState(initialPlate)
  const [notFound, setNotFound] = useState(Boolean(requestedPlate && !requestedVehicle))
  const [simulationIndex, setSimulationIndex] = useState(null)
  const [playing, setPlaying] = useState(false)
  const vehicle = useMemo(() => findVehicleByPlate(vehicles, plate), [plate])
  const events = useMemo(() => vehicle ? getVehicleDetections(detections, vehicle.vehicleId) : [], [vehicle])
  const summary = useMemo(() => vehicle ? buildVehicleSummary(vehicle, events, cameraById) : null, [vehicle, events])
  const visibleEvents = simulationIndex === null ? events : events.slice(0, simulationIndex + 1)

  useEffect(() => {
    if (!playing || simulationIndex === null) return undefined
    if (simulationIndex >= events.length - 1) return undefined
    const timer = window.setTimeout(() => setSimulationIndex((index) => {
      const next = Math.min(index + 1, events.length - 1)
      if (next === events.length - 1) setPlaying(false)
      return next
    }), 1100)
    return () => window.clearTimeout(timer)
  }, [playing, simulationIndex, events.length])

  const searchPlate = (value) => {
    const normalized = normalizePlate(value)
    const match = findVehicleByPlate(vehicles, normalized)
    setQuery(normalized)
    if (!match) {
      setNotFound(true)
      setPlaying(false)
      return
    }
    setNotFound(false)
    setPlate(match.plateNumber)
    setSearchParams({ plate: match.plateNumber }, { replace: true })
    setSimulationIndex(null)
    setPlaying(false)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    searchPlate(query)
  }

  const toggleReplay = () => {
    if (simulationIndex === null || simulationIndex >= events.length - 1) setSimulationIndex(0)
    setPlaying((current) => simulationIndex === null || simulationIndex >= events.length - 1 ? true : !current)
  }

  const resetReplay = () => {
    setPlaying(false)
    setSimulationIndex(null)
  }

  const summaryCards = summary ? [
    [Shapes, 'Vehicle', `${summary.vehicleType} · ${summary.color}`],
    [Clock3, 'First detection', formatDateTime(summary.firstDetection)],
    [Clock3, 'Latest detection', formatDateTime(summary.latestDetection)],
    [Waypoints, 'Cameras crossed', summary.camerasCrossed],
    [Navigation, 'Estimated distance', `${summary.distance} km`],
    [Gauge, 'Average speed', `${summary.averageSpeed} km/h`],
    [ScanText, 'Average OCR confidence', `${summary.averagePlateConfidence}%`],
    [ShieldAlert, 'Flagged events', summary.flaggedEvents],
    [MapPinned, 'Last known area', summary.lastArea],
  ] : []

  return (
    <div>
      <PageHeader
        eyebrow="ANPR trajectory engine"
        title="Vehicle Tracker"
        description="Search a number plate to reconstruct its time-ordered path across Bengaluru camera locations."
      />
      <div className="mb-5"><DataNotice compact /></div>

      <section className="panel mb-5 p-5 sm:p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search size={21} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8996a9]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value.toUpperCase())}
              className="w-full rounded-[14px] border border-[#dce3ec] bg-[#f8fafc] py-4 pl-12 pr-4 text-lg font-semibold uppercase tracking-[0.08em] text-[#202c40] placeholder:text-[#9aa5b5]"
              placeholder="Enter plate number"
              aria-label="Vehicle number plate"
            />
          </div>
          <button type="submit" className="rounded-[14px] bg-[#2563eb] px-7 py-4 text-sm font-semibold text-white shadow-[0_7px_20px_rgba(37,99,235,0.2)] transition-colors hover:bg-[#1d4ed8]">Track vehicle</button>
        </form>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8290a3]">Suggested plates</span>
          {demoPlates.map((item) => (
            <button key={item} type="button" onClick={() => searchPlate(item)} className={`rounded-lg border px-2.5 py-1.5 text-[10px] font-semibold tracking-[0.06em] transition-colors ${plate === item && !notFound ? 'border-[#b8ccf4] bg-[#eaf1ff] text-[#1d4ed8]' : 'border-[#dfe5ed] bg-white text-[#647188] hover:border-[#b8ccf4] hover:text-[#2563eb]'}`}>{item}</button>
          ))}
        </div>
        {notFound && <p className="mt-4 rounded-xl border border-[#f4caca] bg-[#fff0f0] px-4 py-3 text-xs text-[#bd4040]">No matching vehicle was found. Check the plate or try one of the suggested entries.</p>}
      </section>

      {summary && !notFound && (
        <>
          <section className="panel mb-5 p-5 sm:p-6">
            <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#2563eb]">Tracked vehicle</p>
                <h2 className="mt-1.5 text-2xl font-semibold tracking-[0.04em]">{summary.plateNumber}</h2>
                {summary.demoLabel && <p className="mt-1 text-xs text-[#748096]">Movement profile: {summary.demoLabel}</p>}
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={toggleReplay} className="flex items-center gap-2 rounded-xl bg-[#2563eb] px-4 py-2.5 text-xs font-semibold text-white shadow-[0_5px_15px_rgba(37,99,235,0.18)]">
                  {playing ? <Pause size={15} /> : <Play size={15} />}{playing ? 'Pause replay' : 'Play route'}
                </button>
                <button type="button" onClick={resetReplay} className="rounded-xl border border-[#dfe5ed] bg-white p-2.5 text-[#647188] transition-colors hover:text-[#2563eb]" aria-label="Reset route replay"><RotateCcw size={16} /></button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
              {summaryCards.map(([Icon, label, value]) => (
                <div key={label} className="rounded-xl border border-[#e8edf3] bg-[#f7f9fc] p-3.5">
                  <Icon size={16} className="text-[#2563eb]" />
                  <p className="mt-3 text-[10px] font-medium text-[#8290a3]">{label}</p>
                  <p className="mt-1 text-xs font-semibold leading-5 text-[#344054]">{value}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
            <div className="panel p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold">Detection Timeline</h2>
                  <p className="mt-1 text-xs text-[#748096]">{events.length} chronologically ordered events</p>
                </div>
                {simulationIndex !== null && <span className="rounded-full bg-[#eaf1ff] px-2.5 py-1 text-[10px] font-semibold text-[#2563eb]">{Math.min(simulationIndex + 1, events.length)} / {events.length}</span>}
              </div>
              <div className="max-h-[560px] space-y-0 overflow-y-auto pr-2">
                {events.map((event, index) => {
                  const camera = cameraById[event.cameraId]
                  const visible = simulationIndex === null || index <= simulationIndex
                  return (
                    <div key={event.eventId} className={`relative flex gap-4 pb-5 transition-opacity ${visible ? 'opacity-100' : 'opacity-30'}`}>
                      {index < events.length - 1 && <span className="absolute left-[7px] top-4 h-full w-px bg-[#dfe5ed]" />}
                      <span className={`relative z-10 mt-1.5 h-[15px] w-[15px] shrink-0 rounded-full border-[3px] border-white ${index === 0 ? 'bg-[#0f9f8f]' : index === events.length - 1 ? 'bg-[#2563eb]' : 'bg-[#d59124]'}`} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-3">
                          <p className="text-xs font-semibold text-[#344054]">{camera.name}</p>
                          <time className="shrink-0 text-[10px] font-semibold text-[#8290a3]">{formatTime(event.timestamp)}</time>
                        </div>
                        <p className="mt-1 text-[10px] text-[#8995a8]">{camera.cameraId} · {camera.area}</p>
                        <p className="mt-1.5 text-[10px] text-[#748096]">{event.estimatedSpeed} km/h · OCR {Math.round(event.plateConfidence * 100)}% · Object {Math.round(event.objectConfidence * 100)}%</p>
                        <p className="mt-1 text-[10px] text-[#8995a8]">Direction: {event.direction}</p>
                        {event.anomaly && <span className="mt-2 inline-block rounded-full bg-[#fde9e9] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#c74242]">Anomaly flagged</span>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="panel p-3 sm:p-4">
              <div className="mb-3 flex items-center justify-between px-2">
                <div>
                  <h2 className="text-base font-semibold">Reconstructed Trajectory</h2>
                  <p className="mt-1 text-xs text-[#748096]">Start, intermediate detections and last known point</p>
                </div>
                <span className="rounded-full bg-[#eaf1ff] px-2.5 py-1 text-[10px] font-medium text-[#2563eb]">Route reconstruction</span>
              </div>
              <TrafficMap trajectory={visibleEvents} detections={detections} showSegments={false} height="590px" />
            </div>
          </section>
        </>
      )}
    </div>
  )
}
