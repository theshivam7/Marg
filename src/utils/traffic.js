export const PERIODS = [
  { id: 'today', label: 'Today', description: 'Snapshot to 20:30' },
  { id: 'morning', label: 'Morning', description: '06:00–11:59' },
  { id: 'afternoon', label: 'Afternoon', description: '12:00–16:59' },
  { id: 'evening', label: 'Evening', description: '17:00–21:59' },
  { id: 'all', label: 'All Day', description: '00:00–23:59' },
]

export const getLocalHour = (timestamp) => Number(timestamp.slice(11, 13))

export function isInPeriod(timestamp, period) {
  const hour = getLocalHour(timestamp)
  const minute = Number(timestamp.slice(14, 16))
  if (period === 'morning') return hour >= 6 && hour < 12
  if (period === 'afternoon') return hour >= 12 && hour < 17
  if (period === 'evening') return hour >= 17 && hour < 22
  if (period === 'today') return hour < 20 || (hour === 20 && minute <= 30)
  return true
}

export const filterByPeriod = (items, period) => items.filter((item) => isInPeriod(item.timestamp, period))

export const formatTime = (timestamp) => {
  if (!timestamp) return '--:--'
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  }).format(new Date(timestamp))
}

export const formatDateTime = (timestamp) => {
  if (!timestamp) return '--'
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  }).format(new Date(timestamp))
}

export const periodHours = (hour, period) => {
  if (period === 'morning') return hour >= 6 && hour < 12
  if (period === 'afternoon') return hour >= 12 && hour < 17
  if (period === 'evening') return hour >= 17 && hour < 22
  if (period === 'today') return hour <= 20
  return true
}

export const trafficColor = (level) => ({
  normal: '#10b981',
  moderate: '#f59e0b',
  heavy: '#ef4444',
}[level] ?? '#64748b')

export const trafficLabel = (level) => ({
  normal: 'Normal',
  moderate: 'Moderate',
  heavy: 'Heavy',
}[level] ?? 'Unknown')

export const trafficTextColor = (level) => ({
  normal: '#047857',
  moderate: '#9a5600',
  heavy: '#b42318',
}[level] ?? '#475569')

export function getKpis(detections, cameras, segments, alerts, period) {
  const filtered = filterByPeriod(detections, period)
  const speeds = filtered.map((event) => event.estimatedSpeed)
  return {
    vehicles: new Set(filtered.map((event) => event.vehicleId)).size,
    activeCameras: cameras.filter((camera) => camera.status === 'online').length,
    averageSpeed: speeds.length ? Math.round(speeds.reduce((sum, speed) => sum + speed, 0) / speeds.length) : 0,
    congestedSegments: segments.filter((segment) => segment.trafficByPeriod[period] === 'heavy').length,
    alerts: filterByPeriod(alerts, period).filter((alert) => alert.severity !== 'info').length,
  }
}

export function distributionFromDetections(detections) {
  const counts = detections.reduce((result, detection) => {
    result[detection.vehicleType] = (result[detection.vehicleType] ?? 0) + 1
    return result
  }, {})
  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
}

export function cameraMetrics(cameraId, detections) {
  const events = detections.filter((detection) => detection.cameraId === cameraId)
  const averageSpeed = events.length
    ? Math.round(events.reduce((sum, event) => sum + event.estimatedSpeed, 0) / events.length)
    : 0
  return { detections: events.length, averageSpeed }
}
