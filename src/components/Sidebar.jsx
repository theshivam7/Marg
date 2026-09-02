import { Bell, Camera, ChartNoAxesCombined, Map, Radar, Search, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import alerts from '../data/alerts.json'
import cameras from '../data/cameras.json'
import MargLogo from './MargLogo.jsx'

const criticalAlertCount = alerts.filter((alert) => alert.severity === 'critical').length
const onlineCameraCount = cameras.filter((camera) => camera.status === 'online').length

const navigation = [
  { label: 'Overview', to: '/', icon: Radar },
  { label: 'City Map', to: '/map', icon: Map },
  { label: 'Vehicle Tracker', to: '/tracker', icon: Search },
  { label: 'Analytics', to: '/analytics', icon: ChartNoAxesCombined },
  { label: 'Alerts', to: '/alerts', icon: Bell },
]

export default function Sidebar({ open, collapsed, onClose }) {
  return (
    <>
      {/* Mobile Backdrop */}
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-xs lg:hidden"
          onClick={onClose}
          aria-label="Close navigation overlay"
        />
      )}
      <aside
        className={`glass-sidebar fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200/80 px-4 py-5 text-slate-800 transition-all duration-300 ease-in-out ${
          open
            ? 'translate-x-0'
            : collapsed
            ? '-translate-x-full'
            : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="mb-7 flex items-center justify-between px-2 pt-0.5">
          <div className="flex items-center gap-3">
            <MargLogo size={34} />
            <div>
              <p className="text-base font-bold tracking-tight text-slate-900">Marg</p>
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                Bengaluru Traffic
              </p>
            </div>
          </div>
          {/* Close button on mobile */}
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 lg:hidden"
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Section */}
        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Navigation
        </p>
        <nav className="space-y-1" aria-label="Main Navigation">
          {navigation.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-50/90 text-[#0071e3] shadow-2xs font-bold'
                    : 'text-slate-600 hover:translate-x-0.5 hover:bg-white/75 hover:text-slate-900 active:scale-[0.99]'
                }`
              }
            >
              <Icon size={16} strokeWidth={2} />
              <span className="flex-1">{label}</span>
              {label === 'Alerts' && criticalAlertCount > 0 && (
                <span className="rounded-full bg-rose-50 text-rose-600 border border-rose-200 px-2 py-0.2 text-[10px] font-bold">
                  {criticalAlertCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Network Status Footer */}
        <div className="mt-auto rounded-2xl border border-white/80 bg-white/60 p-3.5 shadow-2xs backdrop-blur-xl">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">Surveillance Network</span>
            <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Available
            </span>
          </div>
          <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-slate-200/80">
            <div
              className="h-full rounded-full bg-emerald-500"
              style={{ width: `${(onlineCameraCount / cameras.length) * 100}%` }}
            />
          </div>
          <p className="mt-2 text-[10px] text-slate-500">
            {onlineCameraCount} of {cameras.length} camera nodes online
          </p>
        </div>
      </aside>
    </>
  )
}
