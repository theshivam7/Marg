import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dataDir = resolve(root, 'src/data')
mkdirSync(dataDir, { recursive: true })

let seed = 26127
const random = () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296
  return seed / 4294967296
}
const pick = (items) => items[Math.floor(random() * items.length)]
const pad = (value, width = 2) => String(value).padStart(width, '0')
const writeJson = (name, value) => writeFileSync(resolve(dataDir, name), `${JSON.stringify(value, null, 2)}\n`)

const cameras = [
  ['CAM_001', 'HSR Layout BDA Complex', 'HSR Layout', '14th Main Road', 12.9137415, 77.6374623, 'online', 'Northbound'],
  ['CAM_002', 'HSR Layout 27th Main', 'HSR Layout', '27th Main Road', 12.9118578, 77.6517238, 'online', 'Westbound'],
  ['CAM_003', 'Agara Junction', 'Agara', 'Outer Ring Road', 12.9241248, 77.6479642, 'online', 'Eastbound'],
  ['CAM_004', 'Silk Board Junction', 'Silk Board', 'Hosur Road', 12.9158171, 77.6240368, 'online', 'Northbound'],
  ['CAM_005', 'Madiwala Traffic Police Junction', 'Madiwala', 'Sarjapur Road', 12.9210123, 77.6206703, 'online', 'Northbound'],
  ['CAM_006', 'Koramangala Water Tank', 'Koramangala', 'Sarjapur Road', 12.9269396, 77.6225982, 'online', 'Northbound'],
  ['CAM_007', 'Sony World Signal', 'Koramangala', '100 Feet Road', 12.9374466, 77.6268399, 'online', 'Northbound'],
  ['CAM_008', 'Koramangala 80 Feet Road', 'Koramangala', '80 Feet Road', 12.9330648, 77.6312713, 'online', 'North-east'],
  ['CAM_009', "St. John's Hospital Junction", 'Madiwala', 'Hosur Road', 12.9288983, 77.6152539, 'online', 'Northbound'],
  ['CAM_010', 'Ejipura Signal', 'Ejipura', 'Inner Ring Road', 12.938641, 77.633098, 'online', 'North-east'],
  ['CAM_011', 'Embassy Golf Links', 'Inner Ring Road', 'Inner Ring Road', 12.9510113, 77.6396032, 'online', 'Northbound'],
  ['CAM_012', 'Domlur Flyover', 'Domlur', 'Old Airport Road', 12.9621956, 77.641642, 'online', 'Northbound'],
  ['CAM_013', 'Indiranagar 100 Feet Road', 'Indiranagar', '100 Feet Road', 12.9815418, 77.6410162, 'online', 'Northbound'],
  ['CAM_014', 'Indiranagar Metro / CMH Road', 'Indiranagar', 'CMH Road', 12.9782941, 77.6386519, 'offline', 'Westbound'],
  ['CAM_015', 'Iblur Junction', 'Iblur', 'Outer Ring Road', 12.9206601, 77.6651968, 'online', 'Eastbound'],
  ['CAM_016', 'Bellandur Central Junction', 'Bellandur', 'Outer Ring Road', 12.9262, 77.6751, 'online', 'Eastbound'],
  ['CAM_017', 'Ecospace Bellandur', 'Bellandur', 'Outer Ring Road', 12.9283411, 77.6811574, 'online', 'Eastbound'],
  ['CAM_018', 'Devarabeesanahalli', 'Bellandur', 'Outer Ring Road', 12.9268618, 77.6895136, 'maintenance', 'Eastbound'],
  ['CAM_019', 'Marathahalli Multiplex', 'Marathahalli', 'Outer Ring Road', 12.9512947, 77.6995745, 'online', 'Northbound'],
  ['CAM_020', 'Marathahalli Bridge', 'Marathahalli', 'Varthur Road', 12.9567046, 77.7046424, 'online', 'Northbound'],
  ['CAM_021', 'Adugodi Police Station', 'Adugodi', 'Hosur Road', 12.9398233, 77.6095574, 'online', 'Northbound'],
  ['CAM_022', 'Richmond Circle', 'City Centre', 'Richmond Road', 12.9648914, 77.5969505, 'online', 'Northbound'],
  ['CAM_023', 'Trinity Circle', 'City Centre', 'Mahatma Gandhi Road', 12.9726391, 77.6197456, 'online', 'Eastbound'],
  ['CAM_024', 'MG Road Metro', 'City Centre', 'Mahatma Gandhi Road', 12.9753877, 77.6064952, 'online', 'Westbound'],
  ['CAM_025', 'Halasuru Junction', 'Halasuru', 'Old Madras Road', 12.9778793, 77.6246697, 'online', 'Eastbound'],
].map(([cameraId, name, area, road, latitude, longitude, status, direction], index) => ({
  cameraId,
  name,
  area,
  road,
  latitude,
  longitude,
  status,
  direction,
  trafficByPeriod: {
    today: index % 5 === 0 ? 'heavy' : index % 3 === 0 ? 'moderate' : 'normal',
    morning: [3, 4, 5, 6, 10, 11].includes(index) ? 'heavy' : index % 2 ? 'moderate' : 'normal',
    afternoon: index % 4 === 0 ? 'moderate' : 'normal',
    evening: [2, 6, 7, 9, 14, 15, 16, 17].includes(index) ? 'heavy' : 'moderate',
    all: index % 6 === 0 ? 'heavy' : index % 2 === 0 ? 'moderate' : 'normal',
  },
}))

const cameraById = Object.fromEntries(cameras.map((camera) => [camera.cameraId, camera]))
const haversine = (from, to) => {
  const toRad = (degrees) => (degrees * Math.PI) / 180
  const dLat = toRad(to.latitude - from.latitude)
  const dLon = toRad(to.longitude - from.longitude)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(from.latitude)) * Math.cos(toRad(to.latitude)) * Math.sin(dLon / 2) ** 2
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

const segmentDefinitions = [
  ['CAM_001', 'CAM_002', 'HSR 14th Main → 27th Main'],
  ['CAM_001', 'CAM_003', 'HSR → Agara'],
  ['CAM_001', 'CAM_004', 'HSR → Silk Board'],
  ['CAM_004', 'CAM_005', 'Silk Board → Madiwala'],
  ['CAM_005', 'CAM_009', "Madiwala → St. John's"],
  ['CAM_005', 'CAM_006', 'Madiwala → Koramangala'],
  ['CAM_009', 'CAM_006', "St. John's → Koramangala"],
  ['CAM_006', 'CAM_008', 'Koramangala Water Tank → 80 Feet Road'],
  ['CAM_008', 'CAM_007', '80 Feet Road → Sony World'],
  ['CAM_006', 'CAM_007', 'Koramangala Water Tank → Sony World'],
  ['CAM_007', 'CAM_010', 'Sony World → Ejipura'],
  ['CAM_008', 'CAM_010', '80 Feet Road → Ejipura'],
  ['CAM_010', 'CAM_011', 'Ejipura → Inner Ring Road'],
  ['CAM_011', 'CAM_012', 'Inner Ring Road → Domlur'],
  ['CAM_012', 'CAM_013', 'Domlur → Indiranagar'],
  ['CAM_013', 'CAM_014', '100 Feet Road → CMH Road'],
  ['CAM_003', 'CAM_015', 'Agara → Iblur'],
  ['CAM_015', 'CAM_016', 'Iblur → Bellandur'],
  ['CAM_016', 'CAM_017', 'Bellandur → Ecospace'],
  ['CAM_017', 'CAM_018', 'Ecospace → Devarabeesanahalli'],
  ['CAM_018', 'CAM_019', 'Devarabeesanahalli → Marathahalli Multiplex'],
  ['CAM_019', 'CAM_020', 'Marathahalli Multiplex → Bridge'],
  ['CAM_003', 'CAM_006', 'Agara → Koramangala'],
  ['CAM_015', 'CAM_010', 'Iblur → Ejipura'],
  ['CAM_012', 'CAM_014', 'Domlur → CMH Road'],
  ['CAM_009', 'CAM_021', "St. John's → Adugodi"],
  ['CAM_021', 'CAM_022', 'Adugodi → Richmond Circle'],
  ['CAM_022', 'CAM_024', 'Richmond Circle → MG Road'],
  ['CAM_024', 'CAM_023', 'MG Road → Trinity Circle'],
  ['CAM_023', 'CAM_025', 'Trinity Circle → Halasuru'],
  ['CAM_025', 'CAM_013', 'Halasuru → Indiranagar'],
  ['CAM_012', 'CAM_025', 'Domlur → Halasuru'],
]

const trafficPalette = ['normal', 'moderate', 'heavy']
const roadSegments = segmentDefinitions.map(([fromCameraId, toCameraId, name], index) => {
  const from = cameraById[fromCameraId]
  const to = cameraById[toCameraId]
  const distanceKm = Number((haversine(from, to) * 1.18).toFixed(2))
  const baseVolume = 380 + ((index * 97) % 510)
  return {
    segmentId: `SEG_${pad(index + 1, 3)}`,
    name,
    road: from.road === to.road ? from.road : `${from.road} / ${to.road}`,
    fromCameraId,
    toCameraId,
    distanceKm,
    coordinates: [[from.latitude, from.longitude], [to.latitude, to.longitude]],
    trafficByPeriod: {
      today: trafficPalette[(index * 2 + 1) % 3],
      morning: [2, 3, 5, 9, 10, 12, 13, 14].includes(index) ? 'heavy' : index % 3 === 0 ? 'moderate' : 'normal',
      afternoon: index % 4 === 0 ? 'moderate' : 'normal',
      evening: [1, 5, 8, 10, 16, 17, 18, 19, 20].includes(index) ? 'heavy' : index % 2 ? 'moderate' : 'normal',
      all: index % 7 === 0 ? 'heavy' : index % 2 ? 'moderate' : 'normal',
    },
    volumeByPeriod: {
      today: Math.round(baseVolume * 1.08),
      morning: Math.round(baseVolume * 1.24),
      afternoon: Math.round(baseVolume * 0.73),
      evening: Math.round(baseVolume * 1.38),
      all: Math.round(baseVolume * 3.7),
    },
  }
})

const segmentByPair = new Map()
roadSegments.forEach((segment) => {
  segmentByPair.set(`${segment.fromCameraId}:${segment.toCameraId}`, segment)
  segmentByPair.set(`${segment.toCameraId}:${segment.fromCameraId}`, segment)
})

const typeWeights = ['Car', 'Car', 'Car', 'Motorcycle', 'Motorcycle', 'Scooter', 'Scooter', 'Auto', 'Taxi', 'Bus', 'Van', 'Truck']
const colors = ['White', 'Silver', 'Black', 'Blue', 'Grey', 'Red', 'Beige', 'Yellow']
const important = [
  ['KA01AB1234', 'Car', 'White'],
  ['KA03MN4582', 'Car', 'Black'],
  ['KA05TR9021', 'Truck', 'Blue'],
  ['KA02CX7719', 'Motorcycle', 'Red'],
  ['KA04QZ6118', 'Taxi', 'Silver'],
  ['KA09ZX4481', 'Car', 'Grey'],
  ['KA01MX4821', 'Scooter', 'White'],
  ['KA51PR2048', 'Van', 'Silver'],
  ['KA41UV8830', 'Car', 'Black'],
  ['KA02JL1447', 'Motorcycle', 'Blue'],
]

const usedPlates = new Set(important.map(([plate]) => plate))
const makePlate = () => {
  const districts = ['01', '02', '03', '04', '05', '09', '41', '51', '53']
  let plate
  do {
    const letters = String.fromCharCode(65 + Math.floor(random() * 26)) + String.fromCharCode(65 + Math.floor(random() * 26))
    plate = `KA${pick(districts)}${letters}${pad(1 + Math.floor(random() * 9999), 4)}`
  } while (usedPlates.has(plate))
  usedPlates.add(plate)
  return plate
}

const vehicles = important.map(([plateNumber, vehicleType, color], index) => ({
  vehicleId: `VEH_${pad(index + 1, 3)}`,
  plateNumber,
  vehicleType,
  color,
  demoLabel: ['Daily commute', 'Watchlisted', 'Night ORR truck', 'Repeated commuter', 'Unusual loop', 'Plate duplication', 'OCR mismatch', 'Low-confidence OCR', 'Second watchlist sighting', 'Iblur U-turn pattern'][index],
}))

for (let index = vehicles.length; index < 420; index += 1) {
  vehicles.push({
    vehicleId: `VEH_${pad(index + 1, 3)}`,
    plateNumber: makePlate(),
    vehicleType: pick(typeWeights),
    color: pick(colors),
  })
}

let eventCounter = 1
const detections = []
const isoAt = (minutes, seconds = 0) => {
  const hour = Math.floor(minutes / 60) % 24
  const minute = minutes % 60
  return `2026-09-01T${pad(hour)}:${pad(minute)}:${pad(seconds)}+05:30`
}
const addEvent = (vehicle, cameraId, minute, options = {}) => {
  const camera = cameraById[cameraId]
  if ((cameraId === 'CAM_014' && minute > 1218) || (cameraId === 'CAM_018' && minute > 910)) return
  const baseConfidence = options.plateConfidence ?? (random() < 0.025 ? 0.68 + random() * 0.16 : 0.88 + random() * 0.11)
  const objectConfidence = options.objectConfidence ?? (random() < 0.012 ? 0.79 + random() * 0.1 : 0.92 + random() * 0.075)
  detections.push({
    eventId: `EVT_${pad(eventCounter, 5)}`,
    timestamp: isoAt(minute, options.seconds ?? Math.floor(random() * 55)),
    cameraId,
    vehicleId: vehicle.vehicleId,
    plateNumber: vehicle.plateNumber,
    vehicleType: vehicle.vehicleType,
    plateConfidence: Number(baseConfidence.toFixed(2)),
    objectConfidence: Number(objectConfidence.toFixed(2)),
    estimatedSpeed: options.speed ?? Math.round(18 + random() * 31),
    direction: camera.direction,
    ...(options.anomaly ? { anomaly: options.anomaly } : {}),
  })
  eventCounter += 1
}
const tripMinutes = (route, startMinute) => {
  const minutes = [startMinute]
  for (let index = 1; index < route.length; index += 1) {
    const segment = segmentByPair.get(`${route[index - 1]}:${route[index]}`)
    if (!segment) throw new Error(`Missing road segment for ${route[index - 1]} → ${route[index]}`)
    const hour = Math.floor(minutes[index - 1] / 60)
    const congestion = hour >= 7 && hour < 10 ? 1.65 : hour >= 17 && hour < 21 ? 1.8 : hour < 5 ? 0.78 : 1.08
    const travel = Math.max(3, Math.round((segment.distanceKm / 25) * 60 * congestion + random() * 2))
    minutes.push(minutes[index - 1] + travel)
  }
  return minutes
}
const addTrip = (vehicle, route, startMinute, exactOffsets) => {
  const minutes = exactOffsets ? exactOffsets.map((offset) => startMinute + offset) : tripMinutes(route, startMinute)
  const tripSecond = Math.floor(random() * 50)
  route.forEach((cameraId, index) => {
    if (minutes[index] >= 1440) return
    const hour = Math.floor(minutes[index] / 60)
    const peakPenalty = (hour >= 7 && hour < 10) || (hour >= 17 && hour < 21) ? 12 : hour >= 10 && hour < 17 ? 5 : 0
    const typeBase = { Truck: 34, Bus: 32, Auto: 34, Van: 38, Car: 41, Taxi: 40, Motorcycle: 44, Scooter: 40 }[vehicle.vehicleType] ?? 38
    addEvent(vehicle, cameraId, minutes[index], {
      seconds: tripSecond,
      speed: Math.max(12, Math.min(58, Math.round(typeBase - peakPenalty + random() * 10 - 4))),
    })
  })
}

addTrip(vehicles[0], ['CAM_001', 'CAM_004', 'CAM_005', 'CAM_006', 'CAM_007', 'CAM_010', 'CAM_011', 'CAM_012', 'CAM_013'], 492, [0, 7, 15, 22, 27, 32, 40, 46, 49])
addTrip(vehicles[1], ['CAM_020', 'CAM_019', 'CAM_018', 'CAM_017', 'CAM_016', 'CAM_015', 'CAM_003', 'CAM_001', 'CAM_004'], 1089, [0, 5, 10, 15, 20, 25, 29, 32, 33])
addTrip(vehicles[2], ['CAM_020', 'CAM_019', 'CAM_018', 'CAM_017', 'CAM_016', 'CAM_015', 'CAM_003', 'CAM_001'], 135, [0, 7, 14, 20, 27, 34, 43, 50])
addEvent(vehicles[2], 'CAM_021', 192, { plateConfidence: 0.67, speed: 27, anomaly: 'low_ocr_confidence' })
addTrip(vehicles[3], ['CAM_001', 'CAM_004', 'CAM_005', 'CAM_006', 'CAM_007', 'CAM_010', 'CAM_011', 'CAM_012', 'CAM_013'], 475)
addTrip(vehicles[3], ['CAM_013', 'CAM_012', 'CAM_011', 'CAM_010', 'CAM_007', 'CAM_006', 'CAM_005', 'CAM_004', 'CAM_001'], 1095)
addTrip(vehicles[4], ['CAM_007', 'CAM_010', 'CAM_008', 'CAM_007', 'CAM_010', 'CAM_008', 'CAM_007'], 825, [0, 5, 9, 14, 21, 26, 32])
addEvent(vehicles[4], 'CAM_025', 878, { speed: 24, anomaly: 'unusual_movement' })
addEvent(vehicles[5], 'CAM_020', 719, { speed: 42, anomaly: 'possible_plate_duplication' })
addEvent(vehicles[5], 'CAM_004', 721, { speed: 28, anomaly: 'possible_plate_duplication' })
addEvent(vehicles[6], 'CAM_006', 636, { plateConfidence: 0.94 })
addEvent(vehicles[6], 'CAM_009', 644, { plateConfidence: 0.58, anomaly: 'low_ocr_confidence' })
addEvent(vehicles[6], 'CAM_005', 652, { plateConfidence: 0.91 })
addEvent(vehicles[7], 'CAM_016', 1144, { plateConfidence: 0.92, speed: 24 })
addEvent(vehicles[7], 'CAM_017', 1152, { plateConfidence: 0.62, speed: 19, anomaly: 'low_ocr_confidence' })
addEvent(vehicles[7], 'CAM_018', 1160, { plateConfidence: 0.9, speed: 22 })
addTrip(vehicles[8], ['CAM_017', 'CAM_018', 'CAM_019', 'CAM_020'], 1182, [0, 7, 13, 22])
addTrip(vehicles[9], ['CAM_003', 'CAM_015', 'CAM_010', 'CAM_015', 'CAM_003'], 980, [0, 12, 20, 28, 40])

const routeTemplates = [
  ['CAM_001', 'CAM_004', 'CAM_005', 'CAM_006', 'CAM_007', 'CAM_010', 'CAM_011', 'CAM_012', 'CAM_013'],
  ['CAM_013', 'CAM_012', 'CAM_011', 'CAM_010', 'CAM_007', 'CAM_006', 'CAM_005', 'CAM_004', 'CAM_001'],
  ['CAM_001', 'CAM_003', 'CAM_015', 'CAM_016', 'CAM_017', 'CAM_018', 'CAM_019', 'CAM_020'],
  ['CAM_020', 'CAM_019', 'CAM_018', 'CAM_017', 'CAM_016', 'CAM_015', 'CAM_003', 'CAM_001'],
  ['CAM_002', 'CAM_001', 'CAM_003', 'CAM_006', 'CAM_008', 'CAM_007'],
  ['CAM_004', 'CAM_005', 'CAM_009', 'CAM_006', 'CAM_007', 'CAM_010', 'CAM_011', 'CAM_012'],
  ['CAM_017', 'CAM_016', 'CAM_015', 'CAM_010', 'CAM_011', 'CAM_012', 'CAM_014'],
  ['CAM_014', 'CAM_012', 'CAM_011', 'CAM_010', 'CAM_015', 'CAM_016', 'CAM_017'],
  ['CAM_004', 'CAM_005', 'CAM_009', 'CAM_021', 'CAM_022', 'CAM_024', 'CAM_023', 'CAM_025', 'CAM_013'],
  ['CAM_013', 'CAM_025', 'CAM_023', 'CAM_024', 'CAM_022', 'CAM_021', 'CAM_009', 'CAM_005', 'CAM_004'],
  ['CAM_020', 'CAM_019', 'CAM_018', 'CAM_017', 'CAM_016', 'CAM_015', 'CAM_010', 'CAM_011', 'CAM_012', 'CAM_025', 'CAM_023', 'CAM_024'],
  ['CAM_024', 'CAM_023', 'CAM_025', 'CAM_012', 'CAM_011', 'CAM_010', 'CAM_015', 'CAM_016', 'CAM_017'],
]

const departureWeights = [3, 2, 2, 2, 2, 3, 7, 16, 24, 21, 11, 9, 9, 9, 10, 11, 13, 21, 27, 24, 16, 10, 6, 4]
const weightedHour = () => {
  const total = departureWeights.reduce((sum, weight) => sum + weight, 0)
  let target = random() * total
  for (let hour = 0; hour < departureWeights.length; hour += 1) {
    target -= departureWeights[hour]
    if (target <= 0) return hour
  }
  return 12
}

vehicles.slice(10).forEach((vehicle, index) => {
  const route = routeTemplates[index % routeTemplates.length]
  const hasReturnTrip = index % 5 === 0
  const hour = hasReturnTrip
    ? pick([6, 7, 8, 9])
    : vehicle.vehicleType === 'Truck' && random() < 0.66
      ? pick([0, 1, 2, 3, 4, 5, 22, 23])
      : weightedHour()
  const start = hour * 60 + Math.floor(random() * 44)
  addTrip(vehicle, route, start)
  if (hasReturnTrip) addTrip(vehicle, [...route].reverse(), 1040 + Math.floor(random() * 190))
})

detections.sort((a, b) => a.timestamp.localeCompare(b.timestamp))
detections.forEach((detection, index) => { detection.eventId = `EVT_${pad(index + 1, 5)}` })

const hourlyVolume = Array.from({ length: 24 }, (_, hour) => {
  const morningPeak = 920 * Math.exp(-((hour - 8.5) ** 2) / 3.2)
  const eveningPeak = 1080 * Math.exp(-((hour - 18.2) ** 2) / 5)
  const daytime = hour >= 6 && hour <= 22 ? 520 : 120
  const weekday = Math.round(daytime + morningPeak + eveningPeak + ((hour * 43) % 90))
  const weekend = Math.round((hour >= 9 && hour <= 21 ? 510 : 105) + 520 * Math.exp(-((hour - 13.5) ** 2) / 12) + 460 * Math.exp(-((hour - 19) ** 2) / 8))
  return {
    hour,
    label: `${pad(hour)}:00`,
    weekday,
    weekend,
    averageSpeed: Math.max(17, Math.round(44 - weekday / 72)),
  }
})

const periodMultiplier = { today: 1, morning: 0.31, afternoon: 0.21, evening: 0.37, all: 1.11 }
const corridorNames = [
  'HSR → Silk Board', 'Silk Board → Koramangala', 'Koramangala → Domlur', 'Domlur → Indiranagar',
  'HSR → Agara', 'Agara → Bellandur', 'Bellandur → Marathahalli', "St. John's → Richmond Circle",
  'Richmond Circle → MG Road', 'MG Road → Halasuru',
]
const corridors = corridorNames.map((name, index) => {
  const base = 1920 - index * 135 + (index % 2) * 180
  return {
    name,
    volumeByPeriod: Object.fromEntries(Object.entries(periodMultiplier).map(([period, multiplier]) => [period, Math.round(base * multiplier)])),
    averageSpeed: 19 + index * 2,
    changeFromBaseline: 8 + index * 5,
  }
})
const areaNames = ['HSR Layout', 'Silk Board', 'Koramangala', 'Domlur', 'Indiranagar', 'Bellandur', 'Marathahalli', 'Adugodi', 'City Centre', 'Halasuru']
const areaStats = areaNames.map((name, index) => {
  const base = 2140 - index * 90 + (index % 3) * 170
  return {
    name,
    volumeByPeriod: Object.fromEntries(Object.entries(periodMultiplier).map(([period, multiplier]) => [period, Math.round(base * multiplier)])),
  }
})
const dailyVolumes = [18710, 19480, 20540, 15120, 13780, 18420, 19180, 18860, 19640, 20720, 15310, 13940, 18580, 19220]
const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const dailyTraffic = dailyVolumes.map((volume, index) => {
  const date = new Date(Date.UTC(2026, 7, 19 + index))
  const weekend = date.getUTCDay() === 0 || date.getUTCDay() === 6
  return {
    day: `${dayNames[date.getUTCDay()]} ${date.getUTCDate()} ${monthNames[date.getUTCMonth()]}`,
    volume,
    averageSpeed: weekend ? 34 : 25 + (index % 3),
  }
})

const alerts = [
  ['ALT_001', 'critical', 'Watchlisted vehicle', 'KA03MN4582', 'Detected at Silk Board Junction.', '2026-09-01T18:42:00+05:30', 'CAM_004'],
  ['ALT_002', 'warning', 'Heavy congestion', 'Sony World Junction → Domlur', 'Traffic is 78% above the expected baseline.', '2026-09-01T18:35:00+05:30', 'CAM_007'],
  ['ALT_003', 'warning', 'Possible OCR mismatch', 'KA01MX4821', 'Low-confidence plate read at CAM_009.', '2026-09-01T10:44:00+05:30', 'CAM_009'],
  ['ALT_004', 'warning', 'Unusual vehicle movement', 'KA04QZ6118', 'Repeated movement between the same three junctions.', '2026-09-01T14:17:00+05:30', 'CAM_007'],
  ['ALT_005', 'critical', 'Possible plate duplication', 'KA09ZX4481', 'Same plate detected at impossible locations within two minutes.', '2026-09-01T12:01:00+05:30', 'CAM_004'],
  ['ALT_006', 'info', 'Camera offline', 'CAM_014', 'Last connection was 12 minutes ago.', '2026-09-01T20:18:00+05:30', 'CAM_014'],
  ['ALT_007', 'warning', 'Heavy congestion', 'Agara → Bellandur', 'Average speed fell below 18 km/h.', '2026-09-01T09:05:00+05:30', 'CAM_015'],
  ['ALT_008', 'info', 'Camera maintenance', 'CAM_018', 'Scheduled calibration is in progress.', '2026-09-01T15:10:00+05:30', 'CAM_018'],
  ['ALT_009', 'warning', 'Sudden speed drop', 'Inner Ring Road', 'Corridor speed dropped 32% in ten minutes.', '2026-09-01T17:48:00+05:30', 'CAM_011'],
  ['ALT_010', 'info', 'Traffic normalized', 'HSR → Silk Board', 'Traffic returned to the expected baseline.', '2026-09-01T11:22:00+05:30', 'CAM_004'],
  ['ALT_011', 'warning', 'Low OCR confidence', 'KA51PR2048', 'Plate partly obscured at Bellandur.', '2026-09-01T19:12:00+05:30', 'CAM_017'],
  ['ALT_012', 'critical', 'Watchlisted vehicle', 'KA41UV8830', 'Second sighting near Marathahalli Bridge.', '2026-09-01T20:04:00+05:30', 'CAM_020'],
  ['ALT_013', 'info', 'Camera restored', 'CAM_006', 'Stream processing resumed normally.', '2026-09-01T07:14:00+05:30', 'CAM_006'],
  ['ALT_014', 'warning', 'Unusual vehicle movement', 'KA02JL1447', 'Unexpected U-turn pattern near Iblur.', '2026-09-01T16:32:00+05:30', 'CAM_015'],
  ['ALT_015', 'info', 'Volume threshold reached', 'Indiranagar 100 Feet Road', 'Hourly volume crossed 900 vehicles.', '2026-09-01T18:55:00+05:30', 'CAM_013'],
  ['ALT_016', 'warning', 'Heavy congestion', 'Richmond Circle → MG Road', 'Traffic volume is 61% above the expected baseline.', '2026-09-01T09:18:00+05:30', 'CAM_022'],
  ['ALT_017', 'warning', 'Low OCR confidence', 'KA05TR9021', 'Night-time plate read requires review at Adugodi.', '2026-09-01T03:12:00+05:30', 'CAM_021'],
  ['ALT_018', 'info', 'Traffic normalized', 'Trinity Circle', 'Average speed returned to the expected range.', '2026-09-01T11:48:00+05:30', 'CAM_023'],
  ['ALT_019', 'warning', 'Unusual vehicle movement', 'KA04QZ6118', 'Repeated east-west loop observed near Halasuru.', '2026-09-01T14:38:00+05:30', 'CAM_025'],
  ['ALT_020', 'info', 'Processing latency', 'CAM_024', 'Event processing latency reached 4.2 seconds.', '2026-09-01T18:08:00+05:30', 'CAM_024'],
].map(([alertId, severity, type, subject, message, timestamp, cameraId]) => ({ alertId, severity, type, subject, message, timestamp, cameraId }))

const trafficStats = {
  metadata: {
    snapshotDate: '2026-09-01',
    snapshotTime: '20:30 IST',
    timezone: 'Asia/Kolkata',
    notice: 'Traffic quantities, vehicles, detections and alerts are modeled scenario data.',
  },
  hourlyVolume,
  dailyTraffic,
  corridors,
  areaStats,
  morningVsEvening: areaNames.map((area, index) => ({ area, morning: 680 + index * 70, evening: 790 + ((index * 113) % 410) })),
}

const assert = (condition, message) => { if (!condition) throw new Error(message) }
const allowedVehicleTypes = new Set(['Car', 'Motorcycle', 'Scooter', 'Auto', 'Bus', 'Truck', 'Van', 'Taxi'])
const allowedCameraStatuses = new Set(['online', 'offline', 'maintenance'])
const vehicleById = Object.fromEntries(vehicles.map((vehicle) => [vehicle.vehicleId, vehicle]))
const alertPlatePattern = /^KA\d{2}[A-Z]{2}\d{4}$/
assert(cameras.length === 25, 'Expected 25 cameras')
assert(vehicles.length === 420, 'Expected 420 vehicles')
assert(detections.length >= 3500 && detections.length <= 6000, `Detection count out of range: ${detections.length}`)
assert(alerts.length === 20, 'Expected 20 alerts')
assert(new Set(cameras.map((camera) => camera.cameraId)).size === cameras.length, 'Camera IDs must be unique')
assert(new Set(vehicles.map((vehicle) => vehicle.vehicleId)).size === vehicles.length, 'Vehicle IDs must be unique')
assert(new Set(detections.map((event) => event.eventId)).size === detections.length, 'Event IDs must be unique')
assert(new Set(vehicles.map((vehicle) => vehicle.plateNumber)).size === vehicles.length, 'Vehicle plates must be unique')
vehicles.forEach((vehicle) => {
  assert(alertPlatePattern.test(vehicle.plateNumber), `Invalid plate format: ${vehicle.plateNumber}`)
  assert(allowedVehicleTypes.has(vehicle.vehicleType), `Invalid vehicle type: ${vehicle.vehicleType}`)
})
cameras.forEach((camera) => {
  assert(camera.latitude >= 12.85 && camera.latitude <= 13.05 && camera.longitude >= 77.55 && camera.longitude <= 77.75, `Camera outside Bengaluru bounds: ${camera.cameraId}`)
  assert(allowedCameraStatuses.has(camera.status), `Invalid camera status: ${camera.cameraId}`)
})
roadSegments.forEach((segment) => {
  assert(cameraById[segment.fromCameraId] && cameraById[segment.toCameraId], `Broken segment reference: ${segment.segmentId}`)
  assert(segment.distanceKm > 0 && segment.distanceKm < 12, `Implausible segment distance: ${segment.segmentId}`)
})
detections.forEach((event) => {
  assert(cameraById[event.cameraId], `Unknown camera in ${event.eventId}`)
  assert(vehicleById[event.vehicleId], `Unknown vehicle in ${event.eventId}`)
  assert(vehicleById[event.vehicleId].plateNumber === event.plateNumber, `Plate mismatch in ${event.eventId}`)
  assert(event.plateConfidence >= 0 && event.plateConfidence <= 1, `Invalid confidence in ${event.eventId}`)
  assert(event.objectConfidence >= 0 && event.objectConfidence <= 1, `Invalid object confidence in ${event.eventId}`)
  assert(event.estimatedSpeed >= 10 && event.estimatedSpeed <= 65, `Invalid speed in ${event.eventId}`)
})
const detectionHours = new Set(detections.map((event) => Number(event.timestamp.slice(11, 13))))
assert(detectionHours.size === 24, `Expected full 24-hour detection coverage, received ${detectionHours.size} hours`)
assert(!detections.some((event) => event.cameraId === 'CAM_014' && event.timestamp > '2026-09-01T20:18:59+05:30'), 'Offline camera has detections after its last connection')
assert(!detections.some((event) => event.cameraId === 'CAM_018' && event.timestamp > '2026-09-01T15:10:59+05:30'), 'Maintenance camera has detections after maintenance started')
cameras.forEach((camera) => assert(detections.some((event) => event.cameraId === camera.cameraId), `Camera has no detections: ${camera.cameraId}`))
alerts.filter((alert) => alertPlatePattern.test(alert.subject)).forEach((alert) => {
  const vehicle = vehicles.find((item) => item.plateNumber === alert.subject)
  assert(vehicle, `Alert plate is not searchable: ${alert.subject}`)
  assert(detections.some((event) => event.vehicleId === vehicle.vehicleId && event.cameraId === alert.cameraId && event.timestamp.slice(0, 16) === alert.timestamp.slice(0, 16)), `Alert has no matching detection: ${alert.alertId}`)
})

writeJson('cameras.json', cameras)
writeJson('vehicles.json', vehicles)
writeJson('detections.json', detections)
writeJson('roadSegments.json', roadSegments)
writeJson('trafficStats.json', trafficStats)
writeJson('alerts.json', alerts)

console.log(`Generated ${cameras.length} cameras, ${vehicles.length} vehicles, ${detections.length} detections, ${roadSegments.length} road segments and ${alerts.length} alerts.`)
