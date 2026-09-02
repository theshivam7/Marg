import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import cameras from '../data/cameras.json'
import detections from '../data/detections.json'
import roadSegments from '../data/roadSegments.json'
import { usePeriod } from '../PeriodContext.jsx'
import { cameraMetrics, filterByPeriod, formatTime, trafficColor, trafficLabel, trafficTextColor } from '../utils/traffic.js'
import PageHeader from '../components/PageHeader.jsx'
import TrafficMap from '../components/TrafficMap.jsx'
import AppleSelect from '../components/AppleSelect.jsx'

export default function MapView() {
  const { period } = usePeriod()
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedCamera = searchParams.get('camera')
  const selectedCameraId = cameras.some((camera) => camera.cameraId === requestedCamera)
    ? requestedCamera
    : 'CAM_007'
  const focusCameraId = requestedCamera ? selectedCameraId : null
  const [cameraStatus, setCameraStatus] = useState('all')

  const filteredDetections = useMemo(() => filterByPeriod(detections, period), [period])
  const camera = cameras.find((item) => item.cameraId === selectedCameraId) || cameras[0]
  const metrics = useMemo(
    () => cameraMetrics(selectedCameraId, filteredDetections),
    [selectedCameraId, filteredDetections]
  )
  const connectedSegments = roadSegments.filter(
    (segment) => segment.fromCameraId === selectedCameraId || segment.toCameraId === selectedCameraId
  )

  const cameraOptions = useMemo(() => {
    const list = cameraStatus === 'all' ? cameras : cameras.filter((item) => item.status === cameraStatus)
    return list.map((item) => ({
      value: item.cameraId,
      label: item.name,
      sublabel: `${item.cameraId} · ${item.area} · ${item.road}`,
    }))
  }, [cameraStatus])

  // Recent vehicles at this specific camera
  const cameraRecentVehicles = useMemo(() => {
    return filteredDetections
      .filter((d) => d.cameraId === selectedCameraId)
      .slice()
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
      .slice(0, 4)
  }, [filteredDetections, selectedCameraId])

  const selectCamera = (cameraId) => {
    setSearchParams({ camera: cameraId }, { replace: true })
  }

  const changeStatus = (status) => {
    setCameraStatus(status)
    const options = status === 'all' ? cameras : cameras.filter((item) => item.status === status)
    if (!options.some((item) => item.cameraId === selectedCameraId) && options[0]) {
      selectCamera(options[0].cameraId)
    }
  }

  const statusBadge =
    camera.status === 'online'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : camera.status === 'maintenance'
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : 'bg-rose-50 text-rose-700 border-rose-200'

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow="Surveillance Grid"
        title="City Map"
        description="Inspect camera availability, detection throughput and corridor traffic conditions."
      />

      {/* Main Grid */}
      <section className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* Map Panel */}
        <div className="panel p-4 sm:p-5">
          {/* Controls Bar */}
          <div className="mb-4 grid gap-3 lg:grid-cols-[minmax(260px,1fr)_auto] lg:items-end">
            <div className="w-full min-w-0 lg:max-w-md">
              <label className="block mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Camera Location
              </label>
              <AppleSelect
                value={selectedCameraId}
                onChange={selectCamera}
                options={cameraOptions}
                placeholder="Choose camera node..."
              />
            </div>

            <div>
              <label className="block mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Filter Status
              </label>
              <div className="glass-segmented inline-flex w-full max-w-full items-center overflow-x-auto no-scrollbar rounded-xl p-0.5 lg:w-auto">
                {['all', 'online', 'offline', 'maintenance'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => changeStatus(st)}
                    aria-pressed={cameraStatus === st}
                    className={`shrink-0 rounded-lg px-2.5 sm:px-3 py-1 text-xs font-medium capitalize transition-all ${
                      cameraStatus === st
                        ? 'bg-white/95 text-slate-900 shadow-2xs font-semibold'
                        : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <TrafficMap
            period={period}
            detections={filteredDetections}
            height="clamp(540px, calc(100vh - 230px), 740px)"
            className="city-map-canvas"
            selectedCameraId={selectedCameraId}
            focusCameraId={focusCameraId}
            onCameraSelect={selectCamera}
            showCameraLabels
            showAreaLabels
            showDirection
            cameraStatus={cameraStatus}
          />
        </div>

        {/* Right Camera Details Inspector */}
        <aside className="space-y-5">
          {/* Camera Info Card */}
          <div className="panel p-4 sm:p-5 space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#0071e3]">
                  Selected Camera
                </p>
                <h2 className="mt-1 text-base font-bold text-slate-900">
                  {camera.name}
                </h2>
                <p className="text-xs text-slate-500">
                  {camera.cameraId} · {camera.area}
                </p>
              </div>
              <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold capitalize ${statusBadge}`}>
                {camera.status}
              </span>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-2.5">
                <span className="text-[10px] text-slate-400 font-medium">Road / Corridor</span>
                <p className="font-semibold text-slate-800 mt-0.5 truncate">{camera.road}</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-2.5">
                <span className="text-[10px] text-slate-400 font-medium">Direction</span>
                <p className="font-semibold text-slate-800 mt-0.5">{camera.direction}</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-2.5">
                <span className="text-[10px] text-slate-400 font-medium">Detections</span>
                <p className="font-semibold text-slate-800 mt-0.5">{metrics.detections.toLocaleString('en-IN')}</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-2.5">
                <span className="text-[10px] text-slate-400 font-medium">Avg Speed</span>
                <p className="font-semibold text-slate-800 mt-0.5">{metrics.averageSpeed} km/h</p>
              </div>
            </div>
          </div>

          {/* Recent Vehicles Sighted */}
          <div className="panel p-4 sm:p-5">
            <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Recent Sightings
              </h3>
              <span className="text-[10px] text-slate-400">At this junction</span>
            </div>

            {cameraRecentVehicles.length > 0 ? (
              <div className="space-y-2">
                {cameraRecentVehicles.map((detection) => (
                  <Link
                    key={detection.eventId}
                    to={`/tracker?plate=${detection.plateNumber}`}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 p-2.5 hover:border-blue-300 hover:bg-blue-50/40 active:scale-[0.99] transition-all group"
                  >
                    <div>
                      <span className="plate-badge group-hover:border-blue-400">
                        {detection.plateNumber}
                      </span>
                      <p className="text-[10px] text-slate-500 mt-1">
                        {detection.vehicleType} · {formatTime(detection.timestamp)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-[#0071e3] group-hover:underline">
                        {detection.estimatedSpeed} km/h
                      </span>
                      <span className="block text-[9px] text-slate-400">
                        OCR {Math.round(detection.plateConfidence * 100)}%
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="py-4 text-center text-xs text-slate-400">
                No sightings recorded for this camera in this timeframe.
              </p>
            )}
          </div>

          {/* Connected Road Segments */}
          <div className="panel p-4 sm:p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2.5">
              Connected Segments
            </h3>
            <div className="mt-3 space-y-2">
              {connectedSegments.map((segment) => {
                const level = segment.trafficByPeriod[period]
                return (
                  <div
                    key={segment.segmentId}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 p-2.5 hover:bg-slate-100/60 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ background: trafficColor(level) }}
                      />
                      <p className="text-xs font-medium text-slate-800 truncate">
                        {segment.name}
                      </p>
                    </div>
                    <span
                      className="text-[10px] font-semibold shrink-0"
                      style={{ color: trafficTextColor(level) }}
                    >
                      {segment.distanceKm} km · {trafficLabel(level)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </aside>
      </section>
    </div>
  )
}
