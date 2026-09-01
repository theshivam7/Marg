# Marg

Marg is a city-wide ANPR trajectory tracking and urban traffic analytics dashboard for Bengaluru.

## What Marg does

- Detects and classifies vehicles from structured camera events
- Records plate, camera, direction, confidence, speed and timestamp data
- Matches the same vehicle across camera locations
- Reconstructs time-ordered routes through the city
- Monitors traffic volume, peak hours, speed and corridor congestion
- Surfaces watchlist, OCR, unusual movement, duplication and camera-health alerts

## Data scope

Camera names and coordinates use real Bengaluru locations. Vehicle identities, detections, trajectories, speeds, traffic quantities and alerts are modeled scenario data and are not official or observed Bengaluru traffic statistics.

## Production architecture

```text
CCTV Cameras
  → VideoDB
  → Object Detection + OCR / ANPR + Video Understanding
  → Detection Events
  → Trajectory Engine
  → Traffic Analytics
  → Marg Dashboard
```

VideoDB is the intended video-processing layer for live CCTV streams. This repository includes ready-to-use structured scenario events so the interface runs without cameras, a backend, credentials or environment variables.

## Features

- Operations overview with period filters and derived KPIs
- OpenStreetMap network with 25 Bengaluru camera locations
- Camera availability, detection and corridor condition details
- Number-plate search with vehicle summary and detection confidence
- Chronological detection timeline and reconstructed route map
- Play, pause and reset trajectory replay
- Hourly, area, corridor, vehicle-type and time-comparison charts
- Alert center with severity, type and search filters
- Direct links from alerts to the relevant vehicle or camera
- Responsive layout and Vercel-compatible SPA routing

## Technology stack

- React
- Vite
- JavaScript
- Tailwind CSS
- Leaflet and React Leaflet
- OpenStreetMap
- Recharts
- Lucide React

## Install and run

Use a current Node.js release:

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

The optimized application is written to `dist/`.

## Regenerate scenario data

The generated JSON is already included. To recreate it deterministically:

```bash
npm run generate:data
```

The generator creates 420 vehicles, more than 4,000 detection events, 25 camera locations, 32 connected road segments and 20 alerts. It validates primary keys, plate formats, camera coordinates, confidence ranges, travel connections, full 24-hour coverage and alert references before writing files under `src/data/`.

## Deploy to Vercel

1. Push the project to GitHub.
2. Import the repository as a new Vercel project.
3. Keep the detected Vite settings:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Click **Deploy**.

`vercel.json` rewrites application routes so refreshing `/map`, `/tracker`, `/analytics` or `/alerts` works correctly.

## Showcase number plates

| Plate | Movement profile |
|---|---|
| `KA01AB1234` | HSR Layout to Indiranagar morning commute |
| `KA03MN4582` | Watchlisted vehicle detected at Silk Board |
| `KA05TR9021` | Night truck travelling along Outer Ring Road |
| `KA02CX7719` | Repeated morning and evening commuter |
| `KA04QZ6118` | Repeated loop between nearby junctions |
| `KA09ZX4481` | Possible plate duplication at impossible locations |
| `KA01MX4821` | Low-confidence OCR detection |
| `KA51PR2048` | Low-confidence OCR review at Bellandur |
| `KA41UV8830` | Second watchlist sighting near Marathahalli |
| `KA02JL1447` | Repeated U-turn pattern near Iblur |

Start with `KA01AB1234`, then use `KA03MN4582` and `KA09ZX4481` to connect vehicle tracking with the Alerts page.

## Project structure

```text
src/
  components/    Shared navigation, cards, charts and maps
  pages/         Overview, map, tracker, analytics and alerts
  data/          Static scenario JSON
  utils/         Traffic filtering and trajectory helpers
scripts/
  generateData.mjs
```

## Map attribution

Map tiles and geographic context are provided by [OpenStreetMap contributors](https://www.openstreetmap.org/copyright).
