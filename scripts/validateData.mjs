import { readFileSync } from 'node:fs'

const readJson = (name) => JSON.parse(readFileSync(new URL(`../src/data/${name}.json`, import.meta.url), 'utf8'))
const cameras = readJson('cameras')
const vehicles = readJson('vehicles')
const detections = readJson('detections')
const segments = readJson('roadSegments')
const alerts = readJson('alerts')
const trafficStats = readJson('trafficStats')

const errors = []
const allowedPeriods = ['today', 'morning', 'afternoon', 'evening', 'all']
const allowedTraffic = new Set(['normal', 'moderate', 'heavy'])
const allowedCameraStatuses = new Set(['online', 'offline', 'maintenance'])
const allowedSeverities = new Set(['critical', 'warning', 'info'])
const platePattern = /^KA\d{2}[A-Z]{2}\d{4}$/

const assert = (condition, message) => {
  if (!condition) errors.push(message)
}

const assertUnique = (items, key, label) => {
  const values = items.map((item) => item[key])
  assert(new Set(values).size === values.length, `${label} contains duplicate ${key} values`)
}

const haversine = (from, to) => {
  const toRad = (degrees) => (degrees * Math.PI) / 180
  const latitude = toRad(to.latitude - from.latitude)
  const longitude = toRad(to.longitude - from.longitude)
  const value = Math.sin(latitude / 2) ** 2
    + Math.cos(toRad(from.latitude)) * Math.cos(toRad(to.latitude)) * Math.sin(longitude / 2) ** 2
  return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value))
}

assertUnique(cameras, 'cameraId', 'Camera data')
assertUnique(vehicles, 'vehicleId', 'Vehicle data')
assertUnique(vehicles, 'plateNumber', 'Vehicle data')
assertUnique(detections, 'eventId', 'Detection data')
assertUnique(segments, 'segmentId', 'Road segment data')
assertUnique(alerts, 'alertId', 'Alert data')

const cameraById = new Map(cameras.map((camera) => [camera.cameraId, camera]))
const vehicleById = new Map(vehicles.map((vehicle) => [vehicle.vehicleId, vehicle]))

cameras.forEach((camera) => {
  assert(allowedCameraStatuses.has(camera.status), `${camera.cameraId} has invalid status ${camera.status}`)
  assert(Number.isFinite(camera.latitude) && camera.latitude >= 12.8 && camera.latitude <= 13.1, `${camera.cameraId} has an invalid Bengaluru latitude`)
  assert(Number.isFinite(camera.longitude) && camera.longitude >= 77.4 && camera.longitude <= 77.9, `${camera.cameraId} has an invalid Bengaluru longitude`)
  allowedPeriods.forEach((period) => assert(allowedTraffic.has(camera.trafficByPeriod?.[period]), `${camera.cameraId} is missing valid ${period} traffic`))
})

vehicles.forEach((vehicle) => {
  assert(platePattern.test(vehicle.plateNumber), `${vehicle.vehicleId} has malformed plate ${vehicle.plateNumber}`)
})

detections.forEach((event) => {
  const vehicle = vehicleById.get(event.vehicleId)
  assert(cameraById.has(event.cameraId), `${event.eventId} references unknown camera ${event.cameraId}`)
  assert(Boolean(vehicle), `${event.eventId} references unknown vehicle ${event.vehicleId}`)
  assert(vehicle?.plateNumber === event.plateNumber, `${event.eventId} plate does not match ${event.vehicleId}`)
  assert(vehicle?.vehicleType === event.vehicleType, `${event.eventId} vehicle type does not match ${event.vehicleId}`)
  assert(!Number.isNaN(Date.parse(event.timestamp)), `${event.eventId} has invalid timestamp`)
  assert(event.plateConfidence >= 0 && event.plateConfidence <= 1, `${event.eventId} plate confidence is outside 0–1`)
  assert(event.objectConfidence >= 0 && event.objectConfidence <= 1, `${event.eventId} object confidence is outside 0–1`)
  assert(event.estimatedSpeed >= 0 && event.estimatedSpeed <= 120, `${event.eventId} speed is outside 0–120 km/h`)
})

segments.forEach((segment) => {
  assert(cameraById.has(segment.fromCameraId), `${segment.segmentId} has unknown start camera`)
  assert(cameraById.has(segment.toCameraId), `${segment.segmentId} has unknown end camera`)
  assert(Array.isArray(segment.coordinates) && segment.coordinates.length >= 2, `${segment.segmentId} needs at least two coordinates`)
  assert(segment.distanceKm > 0, `${segment.segmentId} has invalid distance`)
  allowedPeriods.forEach((period) => {
    assert(allowedTraffic.has(segment.trafficByPeriod?.[period]), `${segment.segmentId} is missing valid ${period} traffic`)
    assert(Number.isFinite(segment.volumeByPeriod?.[period]) && segment.volumeByPeriod[period] >= 0, `${segment.segmentId} has invalid ${period} volume`)
  })
})

alerts.forEach((alert) => {
  assert(cameraById.has(alert.cameraId), `${alert.alertId} references unknown camera ${alert.cameraId}`)
  assert(allowedSeverities.has(alert.severity), `${alert.alertId} has invalid severity ${alert.severity}`)
  assert(!Number.isNaN(Date.parse(alert.timestamp)), `${alert.alertId} has invalid timestamp`)
})

const detectionHours = new Set(detections.map((event) => Number(event.timestamp.slice(11, 13))))
assert(detectionHours.size === 24, 'Detection data must cover all 24 hours')
assert(!detections.some((event) => event.cameraId === 'CAM_014' && event.timestamp > '2026-09-01T20:18:59+05:30'), 'Offline camera contains detections after its last connection')
assert(!detections.some((event) => event.cameraId === 'CAM_018' && event.timestamp > '2026-09-01T15:10:59+05:30'), 'Maintenance camera contains detections after maintenance started')
cameras.forEach((camera) => assert(detections.some((event) => event.cameraId === camera.cameraId), `${camera.cameraId} has no detections`))
alerts.filter((alert) => platePattern.test(alert.subject)).forEach((alert) => {
  const vehicle = vehicles.find((item) => item.plateNumber === alert.subject)
  assert(Boolean(vehicle), `${alert.alertId} references a plate that cannot be searched`)
  assert(detections.some((event) => event.vehicleId === vehicle?.vehicleId && event.cameraId === alert.cameraId && event.timestamp.slice(0, 16) === alert.timestamp.slice(0, 16)), `${alert.alertId} has no matching detection event`)
})

const eventsByVehicle = detections.reduce((groups, event) => {
  const events = groups.get(event.vehicleId) ?? []
  events.push(event)
  groups.set(event.vehicleId, events)
  return groups
}, new Map())
eventsByVehicle.forEach((events, vehicleId) => {
  const ordered = [...events].sort((a, b) => a.timestamp.localeCompare(b.timestamp))
  ordered.slice(1).forEach((event, index) => {
    const previous = ordered[index]
    const elapsedHours = (Date.parse(event.timestamp) - Date.parse(previous.timestamp)) / 3_600_000
    assert(elapsedHours > 0, `${vehicleId} has non-increasing detection timestamps`)
    if (elapsedHours <= 0 || event.anomaly || previous.anomaly) return
    const requiredSpeed = haversine(cameraById.get(previous.cameraId), cameraById.get(event.cameraId)) / elapsedHours
    assert(requiredSpeed <= 120, `${vehicleId} requires ${Math.round(requiredSpeed)} km/h between ${previous.cameraId} and ${event.cameraId}`)
  })
})

assert(trafficStats.hourlyVolume?.length === 24, 'Traffic statistics must contain 24 hourly rows')
assert(trafficStats.hourlyVolume?.every((item, index) => item.hour === index), 'Hourly traffic rows must be ordered from 0 through 23')
assert(trafficStats.areaStats?.length > 0, 'Traffic statistics must contain area rows')
assert(trafficStats.corridors?.length > 0, 'Traffic statistics must contain corridor rows')
assert(trafficStats.dailyTraffic?.length >= 7, 'Traffic statistics must contain at least seven daily rows')

if (errors.length) {
  console.error(`Data validation failed with ${errors.length} issue(s):`)
  errors.forEach((error) => console.error(`- ${error}`))
  process.exitCode = 1
} else {
  console.log(`Data validation passed: ${cameras.length} cameras, ${vehicles.length} vehicles, ${detections.length} detections, ${segments.length} segments and ${alerts.length} alerts.`)
}
