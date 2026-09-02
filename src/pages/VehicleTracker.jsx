import { useEffect, useMemo, useState } from 'react'
import {
  Bike,
  Bus,
  Car,
  CheckCircle2,
  Clock,
  Compass,
  Gauge,
  MapPin,
  Navigation,
  Pause,
  Play,
  RotateCcw,
  ScanLine,
  Search,
  ShieldAlert,
  SkipBack,
  SkipForward,
  Truck,
  Waypoints,
} from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import cameras from '../data/cameras.json'
import vehicles from '../data/vehicles.json'
import detections from '../data/detections.json'
import {
  buildVehicleSummary,
  findVehicleByPlate,
  getVehicleDetections,
  normalizePlate,
} from '../utils/vehicleTracking.js'
import { formatTime } from '../utils/traffic.js'
import PageHeader from '../components/PageHeader.jsx'
import TrafficMap from '../components/TrafficMap.jsx'

const cameraById = Object.fromEntries(cameras.map((camera) => [camera.cameraId, camera]))

const demoPlates = [
  { plate: 'KA01AB1234', label: 'Commuter', desc: 'HSR ➔ Indiranagar' },
  { plate: 'KA03MN4582', label: 'Watchlist', desc: 'Silk Board Hit' },
  { plate: 'KA09ZX4481', label: 'Anomaly', desc: 'Velocity Duplicate' },
  { plate: 'KA05TR9021', label: 'Logistics', desc: 'Outer Ring Road' },
  { plate: 'KA02CX7719', label: 'Daily Loop', desc: 'Domlur – Ejipura' },
  { plate: 'KA04QZ6118', label: 'Patrol', desc: 'MG Road Sector' },
]

function VehicleTypeIcon({ type, size = 22, className = '' }) {
  const lower = (type || '').toLowerCase()
  if (lower.includes('bike') || lower.includes('scooter') || lower.includes('two')) {
    return <Bike size={size} strokeWidth={2} className={className} />
  }
  if (lower.includes('truck') || lower.includes('lorry')) {
    return <Truck size={size} strokeWidth={2} className={className} />
  }
  if (lower.includes('bus')) {
    return <Bus size={size} strokeWidth={2} className={className} />
  }
  return <Car size={size} strokeWidth={2} className={className} />
}

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
  const [playSpeed, setPlaySpeed] = useState(1)

  const vehicle = useMemo(() => findVehicleByPlate(vehicles, plate), [plate])
  const events = useMemo(() => (vehicle ? getVehicleDetections(detections, vehicle.vehicleId) : []), [vehicle])
  const summary = useMemo(
    () => (vehicle ? buildVehicleSummary(vehicle, events, cameraById) : null),
    [vehicle, events]
  )

  const activeIndex = simulationIndex === null ? events.length - 1 : simulationIndex

  // Playback timer
  useEffect(() => {
    if (!playing || simulationIndex === null) return undefined
    if (simulationIndex >= events.length - 1) return undefined

    const intervalMs = Math.max(250, Math.round(1000 / playSpeed))
    const timer = window.setTimeout(() => {
      setSimulationIndex((curr) => {
        const next = Math.min(curr + 1, events.length - 1)
        if (next === events.length - 1) setPlaying(false)
        return next
      })
    }, intervalMs)

    return () => window.clearTimeout(timer)
  }, [playing, simulationIndex, events.length, playSpeed])

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

  const togglePlay = () => {
    if (simulationIndex === null || simulationIndex >= events.length - 1) {
      setSimulationIndex(0)
      setPlaying(true)
    } else {
      setPlaying((curr) => !curr)
    }
  }

  const stepForward = () => {
    setPlaying(false)
    setSimulationIndex((curr) => {
      const start = curr === null ? 0 : curr
      return Math.min(start + 1, events.length - 1)
    })
  }

  const stepBackward = () => {
    setPlaying(false)
    setSimulationIndex((curr) => {
      const start = curr === null ? events.length - 1 : curr
      return Math.max(start - 1, 0)
    })
  }

  const resetReplay = () => {
    setPlaying(false)
    setSimulationIndex(null)
  }

  const handleScrubberChange = (e) => {
    setPlaying(false)
    setSimulationIndex(Number(e.target.value))
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow="ANPR Trajectory Engine"
        title="Vehicle Tracker"
        description="Reconstruct time-ordered journeys across 25 Bengaluru camera junctions with interactive timeline scrubbing."
      />

      {/* Search Bar & Scenario Pills */}
      <section className="panel p-4 sm:p-5">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value.toUpperCase())}
              className="w-full rounded-xl border border-slate-200/90 bg-slate-100/80 py-2.5 pl-10 pr-4 text-xs sm:text-sm font-semibold uppercase text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
              placeholder="Enter number plate (e.g. KA01AB1234)"
              aria-label="Vehicle number plate"
            />
          </div>
          <button
            type="submit"
            className="btn-primary py-2.5 sm:py-3 shrink-0"
          >
            Track Route
          </button>
        </form>

        <div className="mt-3 flex items-center gap-1.5 overflow-x-auto no-scrollbar border-t border-slate-100 pt-3">
          <span className="text-[11px] font-medium text-slate-400 shrink-0 mr-1">
            Suggested Profiles:
          </span>
          {demoPlates.map(({ plate: item, label, desc }) => (
            <button
              key={item}
              type="button"
              onClick={() => searchPlate(item)}
              title={desc}
              aria-pressed={plate === item && !notFound}
              className={`shrink-0 flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-medium active:scale-95 transition-all ${
                plate === item && !notFound
                  ? 'bg-blue-50 text-[#0071e3] font-semibold ring-1 ring-blue-500/25'
                  : 'bg-slate-100/70 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span className="font-mono font-bold text-[10px]">{item}</span>
              <span className="text-[9px] text-slate-400">· {label}</span>
            </button>
          ))}
        </div>

        {notFound && (
          <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-600 font-medium">
            No vehicle found with plate &ldquo;{query}&rdquo;. Please check the format or choose a suggested profile above.
          </p>
        )}
      </section>

      {summary && !notFound && (
        <>
          {/* Vehicle Dossier Banner */}
          <section className="panel p-4 sm:p-5 space-y-4">
            {/* Header: Plate & Vehicle Info */}
            <div className="vehicle-command-surface flex flex-col justify-between gap-4 rounded-2xl border border-blue-100/70 p-3 sm:flex-row sm:items-center sm:p-4">
              <div className="flex items-center gap-3">
                {/* Vehicle Type Icon Badge */}
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-[#0071e3] border border-blue-100 shadow-2xs shrink-0">
                  <VehicleTypeIcon type={summary.vehicleType} size={22} />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="plate-badge text-sm sm:text-base px-2.5 py-0.5 shadow-2xs">
                      {summary.plateNumber}
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      {summary.vehicleType} · {summary.color}
                    </span>
                    {summary.flaggedEvents > 0 && (
                      <span className="flex items-center gap-1 rounded-full bg-rose-50 text-rose-600 border border-rose-200 px-2 py-0.2 text-[10px] font-semibold">
                        <ShieldAlert size={11} /> Anomaly Flagged
                      </span>
                    )}
                    {summary.flaggedEvents === 0 && (
                      <span className="hidden items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 sm:flex">
                        <CheckCircle2 size={11} /> Route matched
                      </span>
                    )}
                  </div>
                  {summary.demoLabel && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      {summary.demoLabel}
                    </p>
                  )}
                </div>
              </div>

              {/* Playback Controls & Speed Multipliers */}
              <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                <div className="inline-flex items-center bg-slate-100 rounded-xl p-0.5 border border-black/[0.04]">
                  {[1, 2, 4].map((spd) => (
                    <button
                      key={spd}
                      type="button"
                      onClick={() => setPlaySpeed(spd)}
                      aria-pressed={playSpeed === spd}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${
                        playSpeed === spd
                          ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={stepBackward}
                    className="rounded-xl border border-slate-200/90 bg-white p-2 text-slate-500 hover:text-slate-900 shadow-2xs active:scale-95 transition-all"
                    title="Step backward"
                    aria-label="Step backward"
                  >
                    <SkipBack size={14} />
                  </button>

                  <button
                    type="button"
                    onClick={togglePlay}
                    className="btn-primary py-1.5 px-3.5 text-xs shadow-2xs"
                  >
                    {playing ? <Pause size={13} /> : <Play size={13} />}
                    {playing ? 'Pause' : 'Play Path'}
                  </button>

                  <button
                    type="button"
                    onClick={stepForward}
                    className="rounded-xl border border-slate-200/90 bg-white p-2 text-slate-500 hover:text-slate-900 shadow-2xs active:scale-95 transition-all"
                    title="Step forward"
                    aria-label="Step forward"
                  >
                    <SkipForward size={14} />
                  </button>

                  <button
                    type="button"
                    onClick={resetReplay}
                    className="rounded-xl border border-slate-200/90 bg-white p-2 text-slate-500 hover:text-slate-900 shadow-2xs active:scale-95 transition-all"
                    title="Reset replay"
                    aria-label="Reset route replay"
                  >
                    <RotateCcw size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Vehicle and journey summary */}
            <div className="grid grid-cols-2 gap-2.5 text-xs sm:grid-cols-4 xl:grid-cols-7">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3 hover:bg-slate-100/60 transition-colors">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                  <Waypoints size={13} className="text-[#0071e3]" /> Cameras Crossed
                </div>
                <p className="font-bold text-slate-900 mt-1">{summary.camerasCrossed} nodes</p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3 hover:bg-slate-100/60 transition-colors">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                  <Navigation size={13} className="text-[#34c759]" /> Distance Covered
                </div>
                <p className="font-bold text-slate-900 mt-1">{summary.distance} km</p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3 hover:bg-slate-100/60 transition-colors">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                  <Gauge size={13} className="text-[#ff9500]" /> Average Speed
                </div>
                <p className="font-bold text-slate-900 mt-1">{summary.averageSpeed} km/h</p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3 hover:bg-slate-100/60 transition-colors">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                  <ScanLine size={13} className="text-purple-600" /> OCR Accuracy
                </div>
                <p className="font-bold text-slate-900 mt-1">{summary.averagePlateConfidence}%</p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3 hover:bg-slate-100/60 transition-colors">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                  <Clock size={13} className="text-sky-600" /> First Sighting
                </div>
                <p className="font-semibold text-slate-900 mt-1 truncate">{formatTime(summary.firstDetection)}</p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3 hover:bg-slate-100/60 transition-colors">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                  <CheckCircle2 size={13} className="text-emerald-600" /> Latest Sighting
                </div>
                <p className="font-semibold text-slate-900 mt-1 truncate">{formatTime(summary.latestDetection)}</p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3 hover:bg-slate-100/60 transition-colors">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                  <MapPin size={13} className="text-rose-600" /> Last Known Area
                </div>
                <p className="font-semibold text-slate-900 mt-1 truncate">{summary.lastArea}</p>
              </div>
            </div>

            {/* Timeline Scrubber Slider Bar */}
            <div className="flex items-center gap-3 border-t border-slate-100 pt-3">
              <span className="text-[11px] font-semibold text-slate-500 w-12 text-right shrink-0">
                {simulationIndex === null ? `${events.length}/${events.length}` : `${simulationIndex + 1}/${events.length}`}
              </span>
              <input
                type="range"
                min={0}
                max={events.length - 1}
                value={simulationIndex === null ? events.length - 1 : simulationIndex}
                onChange={handleScrubberChange}
                className="flex-1 accent-[#0071e3] cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                aria-label="Trajectory timeline scrubber"
              />
              <span className="text-[11px] font-semibold text-[#0071e3] w-16 shrink-0">
                {events[activeIndex] ? formatTime(events[activeIndex].timestamp) : ''}
              </span>
            </div>
          </section>

          {/* Grid: Chronological Timeline & Route Map */}
          <section className="grid items-start gap-5 xl:grid-cols-[380px_minmax(0,1fr)]">
            {/* Timeline Panel */}
            <div className="panel p-4 sm:p-5 flex flex-col">
              <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Detection Chronology
                  </h3>
                  <p className="text-xs text-slate-500">
                    {events.length} sequential sightings across network
                  </p>
                </div>
                <span className="rounded-full bg-blue-50 text-[#0071e3] px-2.5 py-0.5 text-[10px] font-semibold">
                  Step {activeIndex + 1} of {events.length}
                </span>
              </div>

              <div className="space-y-2 pr-0.5 xl:max-h-[540px] xl:overflow-y-auto">
                {events.map((event, index) => {
                  const camera = cameraById[event.cameraId]
                  const isCurrent = index === activeIndex
                  const isPassed = simulationIndex === null || index <= simulationIndex

                  return (
                    <button
                      type="button"
                      key={event.eventId}
                      onClick={() => {
                        setPlaying(false)
                        setSimulationIndex(index)
                      }}
                      aria-current={isCurrent ? 'step' : undefined}
                      className={`w-full cursor-pointer rounded-2xl border p-3 text-left transition-all ${
                        isCurrent
                          ? 'border-[#0071e3] bg-blue-50/60 shadow-xs scale-[1.01]'
                          : isPassed
                          ? 'border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-2xs active:scale-[0.99]'
                          : 'border-slate-100 bg-slate-50/50 opacity-40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                              index === 0
                                ? 'bg-[#34c759] text-white'
                                : index === events.length - 1
                                ? 'bg-[#0071e3] text-white'
                                : 'bg-[#ff9500] text-white'
                            }`}
                          >
                            {index + 1}
                          </span>
                          <div>
                            <p className="text-xs font-semibold text-slate-800">{camera?.name}</p>
                            <p className="text-[10px] text-slate-400">{camera?.area} ({camera?.cameraId})</p>
                          </div>
                        </div>
                        <time className="text-[10px] font-semibold text-slate-400">
                          {formatTime(event.timestamp)}
                        </time>
                      </div>

                      <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] text-slate-500 pl-7">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800">
                            {event.estimatedSpeed} km/h
                          </span>
                          <span className="text-slate-300">·</span>
                          <span className="flex items-center gap-0.5 text-slate-500">
                            <Compass size={11} /> {event.direction}
                          </span>
                        </div>
                        <span className="flex items-center gap-1 text-slate-500">
                          <CheckCircle2 size={11} className="text-[#34c759]" /> OCR {Math.round(event.plateConfidence * 100)}%
                        </span>
                      </div>

                      {event.anomaly && (
                        <div className="mt-2 ml-7 rounded-lg bg-rose-50 border border-rose-200 px-2 py-0.5 text-[9px] font-semibold text-rose-600">
                          Anomaly: Velocity Jump Detected
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Map Panel */}
            <div className="panel p-4 sm:p-5">
              <div className="mb-3 flex items-center justify-between px-1">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Reconstructed Trajectory
                  </h3>
                  <p className="text-xs text-slate-500">
                    Active node: <span className="font-semibold text-[#0071e3]">{cameraById[events[activeIndex]?.cameraId]?.name}</span>
                  </p>
                </div>
                <span className="text-xs text-slate-400 font-medium">
                  {events.length} Camera Sightings
                </span>
              </div>

              <TrafficMap
                trajectory={events}
                activeVehicleIndex={activeIndex}
                detections={detections}
                showSegments={false}
                showCameras={false}
                showDirection
                showTrajectoryLabels
                height="clamp(440px, calc(100vh - 290px), 540px)"
                className="trajectory-map-canvas"
              />
            </div>
          </section>
        </>
      )}
    </div>
  )
}
