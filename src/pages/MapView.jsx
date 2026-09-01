import { useMemo, useState } from 'react'
import { Camera, Gauge, MapPin, Radio, Route } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import cameras from '../data/cameras.json'
import detections from '../data/detections.json'
import roadSegments from '../data/roadSegments.json'
import { usePeriod } from '../PeriodContext.jsx'
import { cameraMetrics, filterByPeriod, trafficColor, trafficLabel } from '../utils/traffic.js'
import PageHeader from '../components/PageHeader.jsx'
import PeriodFilter from '../components/PeriodFilter.jsx'
import DataNotice from '../components/DataNotice.jsx'
import TrafficMap from '../components/TrafficMap.jsx'

export default function MapView() {
  const { period } = usePeriod()
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedCamera = searchParams.get('camera')
  const initialCamera = cameras.some((camera) => camera.cameraId === requestedCamera) ? requestedCamera : 'CAM_007'
  const [selectedCameraId, setSelectedCameraId] = useState(initialCamera)
  const [focusCameraId, setFocusCameraId] = useState(requestedCamera ? initialCamera : null)
  const [cameraStatus, setCameraStatus] = useState('all')
  const filteredDetections = useMemo(() => filterByPeriod(detections, period), [period])
  const camera = cameras.find((item) => item.cameraId === selectedCameraId)
  const metrics = useMemo(() => cameraMetrics(selectedCameraId, filteredDetections), [selectedCameraId, filteredDetections])
  const connectedSegments = roadSegments.filter((segment) => segment.fromCameraId === selectedCameraId || segment.toCameraId === selectedCameraId)
  const cameraOptions = cameraStatus === 'all' ? cameras : cameras.filter((item) => item.status === cameraStatus)
  const statusBadge = camera.status === 'online' ? 'bg-[#e3f5f1] text-[#0d8578]' : camera.status === 'maintenance' ? 'bg-[#fff3da] text-[#aa6b0b]' : 'bg-[#fde9e9] text-[#c74242]'

  const selectCamera = (cameraId) => {
    setSelectedCameraId(cameraId)
    setFocusCameraId(cameraId)
    setSearchParams({ camera: cameraId }, { replace: true })
  }

  const changeStatus = (status) => {
    setCameraStatus(status)
    const options = status === 'all' ? cameras : cameras.filter((item) => item.status === status)
    if (!options.some((item) => item.cameraId === selectedCameraId) && options[0]) selectCamera(options[0].cameraId)
  }

  return (
    <div>
      <PageHeader
        eyebrow="Network operations"
        title="City Map"
        description="Inspect camera availability, detection activity and traffic conditions across connected Bengaluru corridors."
        actions={<PeriodFilter />}
      />
      <div className="mb-5"><DataNotice compact /></div>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="panel p-3 sm:p-4">
          <div className="mb-3 grid gap-2 px-1 sm:grid-cols-[minmax(0,1fr)_180px]">
            <label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#748096]">
              Camera location
              <select aria-label="Camera location" value={selectedCameraId} onChange={(event) => selectCamera(event.target.value)} className="mt-1.5 w-full rounded-xl border border-[#dfe5ed] bg-white px-3 py-2.5 text-xs font-medium normal-case tracking-normal text-[#344054] shadow-sm">
                {cameraOptions.map((item) => <option key={item.cameraId} value={item.cameraId}>{item.cameraId} · {item.name}</option>)}
              </select>
            </label>
            <label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#748096]">
              Camera status
              <select aria-label="Camera status" value={cameraStatus} onChange={(event) => changeStatus(event.target.value)} className="mt-1.5 w-full rounded-xl border border-[#dfe5ed] bg-white px-3 py-2.5 text-xs font-medium normal-case tracking-normal text-[#344054] shadow-sm">
                <option value="all">All cameras</option>
                <option value="online">Online only</option>
                <option value="offline">Offline only</option>
                <option value="maintenance">Maintenance only</option>
              </select>
            </label>
          </div>
          <TrafficMap
            period={period}
            detections={filteredDetections}
            height="max(520px, calc(100vh - 330px))"
            selectedCameraId={selectedCameraId}
            focusCameraId={focusCameraId}
            onCameraSelect={selectCamera}
            showCameraLabels
            cameraStatus={cameraStatus}
          />
        </div>

        <aside className="space-y-5">
          <div className="panel p-5">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#2563eb]">Selected camera</p>
                <h2 className="mt-2 text-lg font-semibold leading-tight tracking-[-0.03em]">{camera.name}</h2>
                <p className="mt-1 text-xs text-[#748096]">{camera.cameraId} · {camera.area}</p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold capitalize ${statusBadge}`}>{camera.status}</span>
            </div>
            <dl className="space-y-3">
              {[
                [MapPin, 'Road', camera.road],
                [Camera, 'Direction', camera.direction],
                [Radio, 'Detections', metrics.detections.toLocaleString('en-IN')],
                [Gauge, 'Average speed', `${metrics.averageSpeed} km/h`],
                [Route, 'Traffic level', trafficLabel(camera.trafficByPeriod[period])],
              ].map(([Icon, label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 rounded-xl border border-[#e8edf3] bg-[#f7f9fc] px-3.5 py-3">
                  <dt className="flex items-center gap-2 text-xs text-[#748096]"><Icon size={15} />{label}</dt>
                  <dd className="text-right text-xs font-semibold text-[#344054]" style={label === 'Traffic level' ? { color: trafficColor(camera.trafficByPeriod[period]) } : undefined}>{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="panel p-5">
            <h2 className="text-sm font-semibold">Connected road segments</h2>
            <div className="mt-4 space-y-3">
              {connectedSegments.map((segment) => {
                const level = segment.trafficByPeriod[period]
                return (
                  <div key={segment.segmentId} className="border-b border-[#e8edf3] pb-3 last:border-0 last:pb-0">
                    <div className="flex items-start gap-2.5">
                      <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: trafficColor(level) }} />
                      <div>
                        <p className="text-xs font-medium text-[#344054]">{segment.name}</p>
                        <p className="mt-1 text-[10px] text-[#8290a3]">{segment.distanceKm} km · {trafficLabel(level)}</p>
                      </div>
                    </div>
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
