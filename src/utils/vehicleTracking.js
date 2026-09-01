export const normalizePlate = (value) => value.toUpperCase().replace(/[^A-Z0-9]/g, '')

export const findVehicleByPlate = (vehicles, plate) => {
  const normalized = normalizePlate(plate)
  return vehicles.find((vehicle) => normalizePlate(vehicle.plateNumber) === normalized)
}

export const getVehicleDetections = (detections, vehicleId) => detections
  .filter((detection) => detection.vehicleId === vehicleId)
  .sort((a, b) => a.timestamp.localeCompare(b.timestamp))

const haversine = (from, to) => {
  const toRad = (degrees) => (degrees * Math.PI) / 180
  const dLat = toRad(to.latitude - from.latitude)
  const dLon = toRad(to.longitude - from.longitude)
  const value = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(from.latitude)) * Math.cos(toRad(to.latitude)) * Math.sin(dLon / 2) ** 2
  return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value))
}

export function buildVehicleSummary(vehicle, events, cameraById) {
  const distance = events.slice(1).reduce((total, event, index) => {
    const from = cameraById[events[index].cameraId]
    const to = cameraById[event.cameraId]
    return total + (from && to ? haversine(from, to) * 1.16 : 0)
  }, 0)
  const averageSpeed = events.length
    ? Math.round(events.reduce((sum, event) => sum + event.estimatedSpeed, 0) / events.length)
    : 0
  const averagePlateConfidence = events.length
    ? Math.round((events.reduce((sum, event) => sum + event.plateConfidence, 0) / events.length) * 100)
    : 0
  const lastCamera = events.length ? cameraById[events.at(-1).cameraId] : null
  return {
    ...vehicle,
    firstDetection: events[0]?.timestamp,
    latestDetection: events.at(-1)?.timestamp,
    camerasCrossed: new Set(events.map((event) => event.cameraId)).size,
    distance: Number(distance.toFixed(1)),
    averageSpeed,
    averagePlateConfidence,
    flaggedEvents: events.filter((event) => event.anomaly).length,
    lastArea: lastCamera?.area ?? 'Unknown',
  }
}
