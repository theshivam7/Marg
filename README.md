# Marg

Marg is a Bengaluru traffic intelligence dashboard for ANPR vehicle tracking, route reconstruction, camera monitoring, congestion analytics, and operational alerts.

## Stack

React, Vite, JavaScript, Tailwind CSS, Leaflet, OpenStreetMap, Recharts, and Lucide.

## Run locally

```bash
npm install
npm run dev
```

## Verify and build

```bash
npm run validate:data
npm run lint
npm run build
```

## Demo plates

- `KA01AB1234` — HSR Layout to Indiranagar
- `KA03MN4582` — watchlist alert
- `KA05TR9021` — Outer Ring Road truck route
- `KA02CX7719` — repeated commuter
- `KA04QZ6118` — unusual movement
- `KA09ZX4481` — plate duplication alert

## Deploy

Import the GitHub repository into Vercel. Use `npm run build` and the `dist` output directory. No environment variables are required.
