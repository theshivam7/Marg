import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { PeriodProvider } from './PeriodContext.jsx'
import AppShell from './components/AppShell.jsx'

const Dashboard = lazy(() => import('./pages/Dashboard.jsx'))
const MapView = lazy(() => import('./pages/MapView.jsx'))
const VehicleTracker = lazy(() => import('./pages/VehicleTracker.jsx'))
const Analytics = lazy(() => import('./pages/Analytics.jsx'))
const Alerts = lazy(() => import('./pages/Alerts.jsx'))

function PageLoader() {
  return (
    <div className="panel flex min-h-64 items-center justify-center p-8">
      <div className="text-center">
        <span className="mx-auto block h-7 w-7 animate-spin rounded-full border-2 border-[#dfe5ed] border-t-[#2563eb]" />
        <p className="mt-3 text-xs font-medium text-[#748096]">Loading traffic intelligence</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <PeriodProvider>
      <Suspense fallback={<div className="p-6 lg:pl-72"><PageLoader /></div>}>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<Dashboard />} />
            <Route path="map" element={<MapView />} />
            <Route path="tracker" element={<VehicleTracker />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </PeriodProvider>
  )
}
