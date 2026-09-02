import { Fragment, useEffect, useMemo, useRef } from 'react'
import { divIcon } from 'leaflet'
import { CircleMarker, MapContainer, Marker, Polyline, Popup, TileLayer, Tooltip, useMap } from 'react-leaflet'
import cameras from '../data/cameras.json'
import roadSegments from '../data/roadSegments.json'
import { cameraMetrics, trafficColor, trafficLabel, trafficTextColor } from '../utils/traffic.js'

const cameraById = Object.fromEntries(cameras.map((camera) => [camera.cameraId, camera]))
const networkBounds = cameras.map((camera) => [camera.latitude, camera.longitude])
const statusColor = { online: '#10b981', offline: '#ef4444', maintenance: '#f59e0b' }

const areaLabels = [
  { cameraId: 'CAM_024', label: 'MG Road', direction: 'left', offset: [-6, 0] },
  { cameraId: 'CAM_022', label: 'Richmond Circle', direction: 'left', offset: [-6, 0] },
  { cameraId: 'CAM_023', label: 'Trinity Circle', direction: 'bottom', offset: [0, 7] },
  { cameraId: 'CAM_025', label: 'Halasuru', direction: 'top', offset: [0, -7] },
  { cameraId: 'CAM_013', label: 'Indiranagar', direction: 'right', offset: [6, 0] },
  { cameraId: 'CAM_012', label: 'Domlur', direction: 'right', offset: [6, 0] },
  { cameraId: 'CAM_010', label: 'Ejipura', direction: 'right', offset: [6, 0] },
  { cameraId: 'CAM_007', label: 'Sony World', direction: 'top', offset: [0, -7] },
  { cameraId: 'CAM_006', label: 'Koramangala', direction: 'right', offset: [6, 0] },
  { cameraId: 'CAM_009', label: 'Madiwala', direction: 'left', offset: [-6, 0] },
  { cameraId: 'CAM_004', label: 'Silk Board', direction: 'left', offset: [-6, 0] },
  { cameraId: 'CAM_001', label: 'HSR Layout', direction: 'bottom', offset: [0, 7] },
  { cameraId: 'CAM_003', label: 'Agara', direction: 'right', offset: [6, 0] },
  { cameraId: 'CAM_015', label: 'Iblur', direction: 'bottom', offset: [0, 7] },
  { cameraId: 'CAM_017', label: 'Bellandur', direction: 'bottom', offset: [0, 7] },
  { cameraId: 'CAM_020', label: 'Marathahalli', direction: 'right', offset: [6, 0] },
]

function MapController({ routePositions, focusPosition, resetKey }) {
  const map = useMap()
  const routeRef = useRef(routePositions)
  const focusRef = useRef(focusPosition)

  useEffect(() => {
    routeRef.current = routePositions
    focusRef.current = focusPosition
  })

  useEffect(() => {
    const timer = window.setTimeout(() => {
      map.invalidateSize({ animate: false })
      const routes = routeRef.current
      const focus = focusRef.current
      if (routes.length > 1) {
        map.fitBounds(routes, { padding: [48, 48], maxZoom: 15 })
      } else if (routes.length === 1) {
        map.setView(routes[0], 14)
      } else if (focus) {
        map.setView(focus, 15)
      } else {
        map.fitBounds(networkBounds, { padding: [24, 24], maxZoom: 14 })
      }
    }, 100)
    return () => window.clearTimeout(timer)
  }, [map, resetKey])

  return null
}

function CameraPopup({ camera, metrics, period }) {
  const traffic = camera.trafficByPeriod[period]
  return (
    <div className="min-w-48 text-xs p-1">
      <div className="mb-2 flex items-start justify-between gap-3 border-b border-slate-100 pb-2">
        <div>
          <p className="font-bold text-slate-900">{camera.name}</p>
          <p className="text-[11px] text-slate-500">{camera.cameraId} · {camera.area}</p>
        </div>
        <span
          className="mt-1 h-2 w-2 rounded-full"
          style={{ background: statusColor[camera.status] }}
        />
      </div>
      <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
        <dt className="text-slate-500">Status</dt>
        <dd className="text-right font-medium capitalize text-slate-800">{camera.status}</dd>
        <dt className="text-slate-500">Detections</dt>
        <dd className="text-right font-semibold text-slate-800">{metrics.detections}</dd>
        <dt className="text-slate-500">Avg Speed</dt>
        <dd className="text-right font-semibold text-slate-800">{metrics.averageSpeed} km/h</dd>
        <dt className="text-slate-500">Traffic</dt>
        <dd className="text-right font-semibold" style={{ color: trafficTextColor(traffic) }}>
          {trafficLabel(traffic)}
        </dd>
      </dl>
    </div>
  )
}

function CorridorPopup({ segment, period }) {
  const level = segment.trafficByPeriod[period]
  const id = Number(segment.segmentId.slice(-3))
  const speed = level === 'heavy' ? 16 + (id % 5) : level === 'moderate' ? 24 + (id % 6) : 34 + (id % 7)
  return (
    <div className="min-w-48 text-xs p-1">
      <div className="mb-2 border-b border-slate-100 pb-2">
        <p className="font-bold text-slate-900">{segment.name}</p>
        <span className="mt-1 inline-block text-[10px] font-semibold" style={{ color: trafficTextColor(level) }}>
          {trafficLabel(level)} Traffic
        </span>
      </div>
      <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
        <dt className="text-slate-500">Volume</dt>
        <dd className="text-right font-semibold text-slate-800">{segment.volumeByPeriod[period].toLocaleString('en-IN')}</dd>
        <dt className="text-slate-500">Avg Speed</dt>
        <dd className="text-right font-semibold text-slate-800">{speed} km/h</dd>
        <dt className="text-slate-500">Distance</dt>
        <dd className="text-right font-medium text-slate-800">{segment.distanceKm} km</dd>
      </dl>
    </div>
  )
}

const midpoint = (coordinates) => {
  const [start, end] = coordinates
  return [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2]
}

const bearing = (coordinates) => {
  const [start, end] = coordinates
  const x = end[1] - start[1]
  const y = -(end[0] - start[0])
  return Math.atan2(y, x) * (180 / Math.PI)
}

const directionIcon = (angle, color, opacity) =>
  divIcon({
    className: 'traffic-direction-marker',
    html: `<span style="--direction:${angle}deg;--direction-color:${color};--direction-opacity:${opacity}"></span>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  })

const movingVehicleIcon = divIcon({
  className: 'moving-vehicle-marker',
  html: `
    <div style="position:relative;display:flex;align-items:center;justify-content:center;width:24px;height:24px;">
      <span style="position:absolute;width:100%;height:100%;border-radius:50%;background:#2563eb;opacity:0.3;animation:ping 1.2s cubic-bezier(0,0,0.2,1) infinite;"></span>
      <span style="position:relative;width:12px;height:12px;border-radius:50%;background:#2563eb;border:2px solid #ffffff;box-shadow:0 1px 4px rgba(0,0,0,0.2);"></span>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
})

export default function TrafficMap({
  period = 'today',
  detections = [],
  trajectory = [],
  activeVehicleIndex = null,
  height = '440px',
  selectedCameraId,
  focusCameraId,
  onCameraSelect,
  showSegments = true,
  showCameraLabels = false,
  cameraStatus = 'all',
  showCameras = true,
  showAreaLabels = false,
  interactive = true,
  showDirection = false,
  showTrajectoryLabels = false,
  className = '',
}) {
  const wrapperRef = useRef(null)
  const focusedCamera = focusCameraId ? cameraById[focusCameraId] : null

  // Complete trajectory coordinates
  const fullRoutePositions = useMemo(
    () =>
      trajectory
        .map((event) => cameraById[event.cameraId])
        .filter(Boolean)
        .map((camera) => [camera.latitude, camera.longitude]),
    [trajectory]
  )

  const currentStep = activeVehicleIndex === null ? fullRoutePositions.length - 1 : activeVehicleIndex
  const activeRoutePositions = useMemo(
    () => fullRoutePositions.slice(0, currentStep + 1),
    [fullRoutePositions, currentStep]
  )
  const activePosition = fullRoutePositions[currentStep] || null

  const metricsByCamera = useMemo(
    () =>
      Object.fromEntries(
        cameras.map((camera) => [camera.cameraId, cameraMetrics(camera.cameraId, detections)])
      ),
    [detections]
  )

  const visibleCameras = cameraStatus === 'all' ? cameras : cameras.filter((camera) => camera.status === cameraStatus)

  const densityCounts = roadSegments.reduce(
    (counts, segment) => {
      counts[segment.trafficByPeriod[period]] += 1
      return counts
    },
    { normal: 0, moderate: 0, heavy: 0 }
  )

  const resetKey = `${height}-${period}-${focusCameraId ?? 'network'}-${trajectory[0]?.eventId ?? 'none'}-${trajectory.length}`

  return (
    <div
      ref={wrapperRef}
      className={`traffic-network-map relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50 ${className}`}
      style={{ height }}
      role="region"
      aria-label={trajectory.length ? 'Reconstructed vehicle trajectory map' : 'Bengaluru traffic network map'}
    >
      <MapContainer
        center={[12.938, 77.658]}
        zoom={13}
        zoomControl={interactive}
        dragging={interactive}
        doubleClickZoom={interactive}
        scrollWheelZoom={interactive}
        touchZoom={interactive}
        boxZoom={interactive}
        keyboard={interactive}
        attributionControl={true}
        className={`h-full ${interactive ? '' : 'cursor-default'}`}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          opacity={0.65}
        />
        <MapController
          routePositions={fullRoutePositions}
          focusPosition={focusedCamera ? [focusedCamera.latitude, focusedCamera.longitude] : null}
          resetKey={resetKey}
        />

        {/* Road Segments */}
        {showSegments &&
          roadSegments.map((segment) => {
            const level = segment.trafficByPeriod[period]
            const isConnected =
              !focusCameraId ||
              segment.fromCameraId === focusCameraId ||
              segment.toCameraId === focusCameraId
            const weight = level === 'heavy' ? 6 : level === 'moderate' ? 4.5 : 3
            const opacity = !isConnected ? 0.2 : level === 'normal' ? 0.6 : level === 'moderate' ? 0.85 : 0.95

            return (
              <Fragment key={segment.segmentId}>
                <Polyline
                  positions={segment.coordinates}
                  pathOptions={{
                    color: trafficColor(level),
                    weight,
                    opacity,
                    lineCap: 'round',
                    dashArray: level === 'moderate' ? '6 4' : undefined,
                  }}
                >
                  <Tooltip sticky direction="top">
                    <div className="text-xs p-0.5">
                      <p className="font-semibold">{segment.name}</p>
                      <p className="text-slate-500">{trafficLabel(level)} Traffic</p>
                    </div>
                  </Tooltip>
                  <Popup>
                    <CorridorPopup segment={segment} period={period} />
                  </Popup>
                </Polyline>
                {showDirection && level !== 'normal' && (
                  <Marker
                    position={midpoint(segment.coordinates)}
                    icon={directionIcon(bearing(segment.coordinates), trafficColor(level), opacity)}
                    interactive={false}
                    keyboard={false}
                    title={`Direction on ${segment.name}`}
                  />
                )}
              </Fragment>
            )
          })}

        {/* Camera Nodes */}
        {showCameras &&
          visibleCameras.map((camera) => {
            const selected = selectedCameraId === camera.cameraId || focusCameraId === camera.cameraId
            return (
              <CircleMarker
                key={camera.cameraId}
                center={[camera.latitude, camera.longitude]}
                radius={selected ? 8 : 5}
                pathOptions={{
                  color: statusColor[camera.status],
                  weight: selected ? 3 : 2,
                  fillColor: '#ffffff',
                  fillOpacity: 1,
                }}
                eventHandlers={{ click: () => onCameraSelect?.(camera.cameraId) }}
              >
                {showCameraLabels && (
                  <Tooltip direction="top" offset={[0, -7]}>
                    {camera.cameraId}
                  </Tooltip>
                )}
                <Popup>
                  <CameraPopup camera={camera} metrics={metricsByCamera[camera.cameraId]} period={period} />
                </Popup>
              </CircleMarker>
            )
          })}

        {/* Area Context Labels */}
        {showAreaLabels &&
          areaLabels.map(({ cameraId, label, direction, offset }) => {
            const camera = cameraById[cameraId]
            return (
              <CircleMarker
                key={`area-${cameraId}`}
                center={[camera.latitude, camera.longitude]}
                radius={3}
                pathOptions={{ color: '#ffffff', weight: 1.5, fillColor: '#2563eb', fillOpacity: 1 }}
              >
                <Tooltip permanent direction={direction} offset={offset} className="area-map-label">
                  {label}
                </Tooltip>
              </CircleMarker>
            )
          })}

        {/* Focused Camera Ring */}
        {focusedCamera && (
          <CircleMarker
            center={[focusedCamera.latitude, focusedCamera.longitude]}
            radius={14}
            pathOptions={{ color: '#2563eb', weight: 2, fillColor: '#2563eb', fillOpacity: 0.12 }}
          />
        )}

        {/* Vehicle Trajectory Path */}
        {fullRoutePositions.length > 0 && (
          <>
            {/* Base Route Track */}
            <Polyline
              positions={fullRoutePositions}
              pathOptions={{ color: '#94a3b8', weight: 3, opacity: 0.4, lineCap: 'round', dashArray: '4 4' }}
            />

            {/* Active Progression Path */}
            {activeRoutePositions.length > 1 && (
              <Polyline
                positions={activeRoutePositions}
                pathOptions={{ color: '#2563eb', weight: 5, opacity: 0.9, lineCap: 'round' }}
              />
            )}

            {/* Waypoints */}
            {fullRoutePositions.map((position, index) => {
              const event = trajectory[index]
              const camera = cameraById[event?.cameraId]
              const isStart = index === 0
              const isEnd = index === fullRoutePositions.length - 1
              const isPassed = index <= currentStep
              const label = areaLabels.find((item) => item.cameraId === camera?.cameraId)?.label ?? camera?.area

              return (
                <CircleMarker
                  key={`${event?.eventId ?? index}-${index}`}
                  center={position}
                  radius={isStart || isEnd ? 7 : 4.5}
                  pathOptions={{
                    color: isPassed ? '#ffffff' : '#94a3b8',
                    weight: isPassed ? 2.5 : 1,
                    fillColor: !isPassed ? '#cbd5e1' : isStart ? '#10b981' : isEnd ? '#2563eb' : '#f59e0b',
                    fillOpacity: 1,
                  }}
                >
                  <Tooltip
                    permanent={showTrajectoryLabels && isPassed}
                    direction={index % 2 === 0 ? 'left' : 'right'}
                    offset={index % 2 === 0 ? [-6, 0] : [6, 0]}
                    className={showTrajectoryLabels ? 'trajectory-map-label' : ''}
                  >
                    {showTrajectoryLabels ? (
                      <span>
                        <strong>{isStart ? 'Start' : isEnd ? 'End' : `#${index + 1}`}</strong> · {label}
                      </span>
                    ) : (
                      <div className="text-xs">
                        <strong>{isStart ? 'Origin' : isEnd ? 'Destination' : `Stop #${index + 1}`}</strong>
                        <br />
                        {camera?.name}
                      </div>
                    )}
                  </Tooltip>
                </CircleMarker>
              )
            })}

            {/* Moving Vehicle Marker */}
            {activePosition && (
              <Marker
                position={activePosition}
                icon={movingVehicleIcon}
                interactive={false}
                keyboard={false}
                title="Current vehicle position"
              />
            )}
          </>
        )}
      </MapContainer>

      {/* Clean Traffic Density Legend */}
      {showSegments && (
        <div className="pointer-events-none absolute bottom-3 left-3 z-[400] rounded-lg border border-slate-200 bg-white/95 px-3 py-1.5 text-[10px] font-medium text-slate-700 shadow-sm backdrop-blur-xs">
          <div className="flex items-center gap-3">
            {[
              ['Normal', '#10b981', densityCounts.normal],
              ['Moderate', '#f59e0b', densityCounts.moderate],
              ['Heavy', '#ef4444', densityCounts.heavy],
            ].map(([label, color, count]) => (
              <span key={label} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: color }} />
                <span>{label}</span>
                <strong className="text-slate-900">({count})</strong>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
