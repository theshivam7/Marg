import { useEffect, useMemo } from 'react'
import { CircleMarker, MapContainer, Polyline, Popup, TileLayer, Tooltip, useMap } from 'react-leaflet'
import cameras from '../data/cameras.json'
import roadSegments from '../data/roadSegments.json'
import { cameraMetrics, trafficColor, trafficLabel } from '../utils/traffic.js'

const cameraById = Object.fromEntries(cameras.map((camera) => [camera.cameraId, camera]))
const networkBounds = cameras.map((camera) => [camera.latitude, camera.longitude])
const statusColor = { online: '#0f9f8f', offline: '#d85353', maintenance: '#d59124' }

function MapController({ routePositions, focusPosition, resetKey }) {
  const map = useMap()

  useEffect(() => {
    const timer = window.setTimeout(() => map.invalidateSize(), 100)
    return () => window.clearTimeout(timer)
  }, [map, resetKey])

  useEffect(() => {
    if (routePositions.length > 1) {
      map.fitBounds(routePositions, { padding: [42, 42], maxZoom: 15 })
    } else if (focusPosition) {
      map.setView(focusPosition, 15)
    } else {
      map.fitBounds(networkBounds, { padding: [24, 24], maxZoom: 13 })
    }
  }, [map, routePositions, focusPosition])

  return null
}

function CameraPopup({ camera, metrics, period }) {
  const traffic = camera.trafficByPeriod[period]
  return (
    <div className="min-w-52 text-xs">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-[#202c40]">{camera.name}</p>
          <p className="mt-0.5 text-[10px] font-medium text-[#8290a3]">{camera.cameraId} · {camera.area}</p>
        </div>
        <span className="mt-1 h-2 w-2 rounded-full" style={{ background: statusColor[camera.status] }} />
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px]">
        <dt className="text-[#8290a3]">Status</dt><dd className="text-right font-medium capitalize">{camera.status}</dd>
        <dt className="text-[#8290a3]">Detections</dt><dd className="text-right font-medium">{metrics.detections}</dd>
        <dt className="text-[#8290a3]">Average speed</dt><dd className="text-right font-medium">{metrics.averageSpeed} km/h</dd>
        <dt className="text-[#8290a3]">Traffic</dt><dd className="text-right font-medium" style={{ color: trafficColor(traffic) }}>{trafficLabel(traffic)}</dd>
      </dl>
    </div>
  )
}

export default function TrafficMap({
  period = 'today',
  detections = [],
  trajectory = [],
  height = '420px',
  selectedCameraId,
  focusCameraId,
  onCameraSelect,
  showSegments = true,
  showCameraLabels = false,
  cameraStatus = 'all',
}) {
  const routePositions = useMemo(() => trajectory
    .map((event) => cameraById[event.cameraId])
    .filter(Boolean)
    .map((camera) => [camera.latitude, camera.longitude]), [trajectory])

  const metricsByCamera = useMemo(() => Object.fromEntries(cameras.map((camera) => [camera.cameraId, cameraMetrics(camera.cameraId, detections)])), [detections])
  const focusCamera = focusCameraId ? cameraById[focusCameraId] : null
  const visibleCameras = cameraStatus === 'all' ? cameras : cameras.filter((camera) => camera.status === cameraStatus)

  return (
    <div className="relative overflow-hidden rounded-[14px] border border-[#dfe5ed]" style={{ height }}>
      <MapContainer center={[12.938, 77.658]} zoom={13} scrollWheelZoom className="h-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController routePositions={routePositions} focusPosition={focusCamera ? [focusCamera.latitude, focusCamera.longitude] : null} resetKey={`${height}-${period}`} />

        {showSegments && roadSegments.map((segment) => {
          const level = segment.trafficByPeriod[period]
          return (
            <Polyline
              key={segment.segmentId}
              positions={segment.coordinates}
              pathOptions={{ color: trafficColor(level), weight: 5, opacity: 0.72, lineCap: 'round' }}
            >
              <Tooltip sticky direction="top">
                <div className="text-xs">
                  <p className="font-semibold">{segment.name}</p>
                  <p className="mt-0.5 text-[#69758a]">{trafficLabel(level)} · {segment.distanceKm} km</p>
                </div>
              </Tooltip>
            </Polyline>
          )
        })}

        {visibleCameras.map((camera) => (
          <CircleMarker
            key={camera.cameraId}
            center={[camera.latitude, camera.longitude]}
            radius={selectedCameraId === camera.cameraId ? 9 : 6}
            pathOptions={{
              color: '#ffffff',
              weight: selectedCameraId === camera.cameraId ? 4 : 3,
              fillColor: statusColor[camera.status],
              fillOpacity: 1,
            }}
            eventHandlers={{ click: () => onCameraSelect?.(camera.cameraId) }}
          >
            {showCameraLabels && <Tooltip direction="top" offset={[0, -7]}>{camera.cameraId}</Tooltip>}
            <Popup><CameraPopup camera={camera} metrics={metricsByCamera[camera.cameraId]} period={period} /></Popup>
          </CircleMarker>
        ))}

        {routePositions.length > 0 && (
          <>
            <Polyline positions={routePositions} pathOptions={{ color: '#2563eb', weight: 6, opacity: 0.9, lineCap: 'round', lineJoin: 'round' }} />
            {routePositions.map((position, index) => {
              const isStart = index === 0
              const isEnd = index === routePositions.length - 1
              const event = trajectory[index]
              const camera = cameraById[event.cameraId]
              return (
                <CircleMarker
                  key={`${event.eventId}-${index}`}
                  center={position}
                  radius={isStart || isEnd ? 8 : 5}
                  pathOptions={{ color: '#ffffff', weight: 3, fillColor: isStart ? '#0f9f8f' : isEnd ? '#2563eb' : '#d59124', fillOpacity: 1 }}
                >
                  <Tooltip direction="top" offset={[0, -7]}>
                    <div className="text-xs"><strong>{isStart ? 'Start' : isEnd ? 'Last detection' : `Detection ${index + 1}`}</strong><br />{camera.name}</div>
                  </Tooltip>
                </CircleMarker>
              )
            })}
          </>
        )}
      </MapContainer>

      <div className="pointer-events-none absolute bottom-6 left-3 z-[400] flex flex-wrap gap-2 rounded-xl border border-[#dfe5ed] bg-white/95 px-3 py-2 text-[10px] font-medium text-[#5f6d82] shadow-md backdrop-blur">
        {[['Normal', '#1b9a78'], ['Moderate', '#d59124'], ['Heavy', '#d85353']].map(([label, color]) => (
          <span key={label} className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: color }} />{label}</span>
        ))}
      </div>
    </div>
  )
}
