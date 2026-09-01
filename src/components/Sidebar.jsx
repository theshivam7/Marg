import { Bell, ChartNoAxesCombined, Map, Radar, Search, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import alerts from '../data/alerts.json'
import cameras from '../data/cameras.json'

const criticalAlertCount = alerts.filter((alert) => alert.severity === 'critical').length
const onlineCameraCount = cameras.filter((camera) => camera.status === 'online').length

const navigation = [
  { label: 'Overview', to: '/', icon: Radar },
  { label: 'City Map', to: '/map', icon: Map },
  { label: 'Vehicle Tracker', to: '/tracker', icon: Search },
  { label: 'Analytics', to: '/analytics', icon: ChartNoAxesCombined },
  { label: 'Alerts', to: '/alerts', icon: Bell },
]

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && <button type="button" className="fixed inset-0 z-40 bg-[#08101f]/55 backdrop-blur-sm lg:hidden" onClick={onClose} aria-label="Close navigation overlay" />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/8 bg-[#0b1424] px-4 py-5 text-white shadow-[12px_0_40px_rgba(15,23,42,0.08)] transition-transform duration-200 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="mb-9 flex items-start justify-between px-2 pt-1">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-[13px] bg-white shadow-[0_6px_20px_rgba(37,99,235,0.25)]">
              <img src="/marg-logo.png" alt="" className="h-9 w-9 object-contain" />
            </span>
            <div>
              <p className="text-[22px] font-semibold tracking-[-0.045em]">Marg</p>
              <p className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.17em] text-[#7f8da5]">Traffic intelligence</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-[#8794aa] hover:bg-white/5 hover:text-white lg:hidden" aria-label="Close navigation"><X size={18} /></button>
        </div>

        <p className="mb-2 px-3 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#65738a]">Workspace</p>
        <nav className="space-y-1" aria-label="Primary navigation">
          {navigation.map(({ label, to, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/'} onClick={onClose} className={({ isActive }) => `group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all ${isActive ? 'bg-[#2563eb] text-white shadow-[0_8px_22px_rgba(37,99,235,0.25)]' : 'text-[#98a5b9] hover:bg-white/[0.055] hover:text-white'}`}>
              <Icon size={17} strokeWidth={1.9} />
              <span className="flex-1">{label}</span>
              {label === 'Alerts' && <span className="rounded-full bg-[#d85353] px-2 py-0.5 text-[9px] font-semibold text-white">{criticalAlertCount}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto rounded-2xl border border-white/[0.08] bg-white/[0.045] p-4">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-white">Network status</p>
            <span className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-[#55d4b5]"><span className="h-1.5 w-1.5 rounded-full bg-[#39c69f] shadow-[0_0_0_4px_rgba(57,198,159,0.1)]" />Operational</span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.08]"><div className="h-full rounded-full bg-[#39c69f]" style={{ width: `${(onlineCameraCount / cameras.length) * 100}%` }} /></div>
          <div className="mt-2.5 flex items-center justify-between text-[10px] text-[#7f8da5]"><span>{onlineCameraCount} of {cameras.length} feeds online</span><span>Bengaluru · IST</span></div>
        </div>
      </aside>
    </>
  )
}
