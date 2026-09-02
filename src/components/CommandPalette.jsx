import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Camera, Car, ChartNoAxesCombined, CornerDownLeft, Map, Radar, Search, X } from 'lucide-react'
import vehicles from '../data/vehicles.json'
import cameras from '../data/cameras.json'
import alerts from '../data/alerts.json'

export default function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef(null)
  const listRef = useRef(null)
  const dialogRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (isOpen) {
      const previousOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      const timer = setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
      return () => {
        clearTimeout(timer)
        document.body.style.overflow = previousOverflow
      }
    }
    return undefined
  }, [isOpen])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    const items = []

    // 1. Pages
    const pages = [
      { id: 'page-overview', category: 'Pages', title: 'Traffic Overview', subtitle: 'Network KPIs & Map', icon: Radar, path: '/' },
      { id: 'page-map', category: 'Pages', title: 'City Map', subtitle: 'Camera Network & Corridors', icon: Map, path: '/map' },
      { id: 'page-tracker', category: 'Pages', title: 'Vehicle Tracker', subtitle: 'ANPR Trajectory Reconstruction', icon: Car, path: '/tracker' },
      { id: 'page-analytics', category: 'Pages', title: 'Traffic Analytics', subtitle: 'Volume & Speed Trends', icon: ChartNoAxesCombined, path: '/analytics' },
      { id: 'page-alerts', category: 'Pages', title: 'Alerts Center', subtitle: 'Watchlist & Incidents', icon: Bell, path: '/alerts' },
    ]

    for (const p of pages) {
      if (!q || p.title.toLowerCase().includes(q) || p.subtitle.toLowerCase().includes(q)) {
        items.push(p)
      }
    }

    // 2. Vehicles
    if (q) {
      const matchedVehicles = vehicles
        .filter((v) => v.plateNumber.toLowerCase().includes(q) || v.vehicleType.toLowerCase().includes(q) || v.color.toLowerCase().includes(q) || (v.demoLabel && v.demoLabel.toLowerCase().includes(q)))
        .slice(0, 5)
        .map((v) => ({
          id: `veh-${v.vehicleId}`,
          category: 'Vehicles',
          title: v.plateNumber,
          subtitle: `${v.vehicleType} · ${v.color}${v.demoLabel ? ` · ${v.demoLabel}` : ''}`,
          icon: Car,
          path: `/tracker?plate=${v.plateNumber}`,
        }))
      items.push(...matchedVehicles)

      // 3. Cameras
      const matchedCameras = cameras
        .filter((c) => c.name.toLowerCase().includes(q) || c.cameraId.toLowerCase().includes(q) || c.area.toLowerCase().includes(q) || c.road.toLowerCase().includes(q))
        .slice(0, 5)
        .map((c) => ({
          id: `cam-${c.cameraId}`,
          category: 'Cameras',
          title: `${c.cameraId} · ${c.name}`,
          subtitle: `${c.area} · ${c.road} (${c.status})`,
          icon: Camera,
          path: `/map?camera=${c.cameraId}`,
        }))
      items.push(...matchedCameras)

      // 4. Alerts
      const matchedAlerts = alerts
        .filter((a) => a.type.toLowerCase().includes(q) || a.subject.toLowerCase().includes(q) || a.message.toLowerCase().includes(q))
        .slice(0, 3)
        .map((a) => ({
          id: `alt-${a.alertId}`,
          category: 'Alerts',
          title: `${a.type}: ${a.subject}`,
          subtitle: a.message,
          icon: Bell,
          path: a.subject.startsWith('KA') ? `/tracker?plate=${a.subject}` : `/map?camera=${a.cameraId}`,
        }))
      items.push(...matchedAlerts)
    }

    return items
  }, [query])

  const handleClose = () => {
    setQuery('')
    setSelectedIndex(0)
    onClose()
  }

  const selectItem = (item) => {
    if (!item) return
    navigate(item.path)
    handleClose()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      const focusable = dialogRef.current?.querySelectorAll('button:not([disabled]), input:not([disabled])')
      if (!focusable?.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((idx) => (idx + 1) % Math.max(1, results.length))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((idx) => (idx - 1 + results.length) % Math.max(1, results.length))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (results[selectedIndex]) {
        selectItem(results[selectedIndex])
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24">
      {/* Backdrop */}
      <button
        type="button"
        className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity"
        onClick={handleClose}
        aria-label="Close command palette"
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Global search"
        className="glass-popover relative z-10 w-full max-w-xl overflow-hidden rounded-2xl animate-in fade-in zoom-in-95 duration-150"
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b border-slate-100 bg-white px-4 py-3.5">
          <Search size={18} className="shrink-0 text-slate-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            placeholder="Search number plates, cameras, alerts, pages..."
            aria-label="Search Marg"
            className="flex-1 bg-transparent text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none border-none ring-0 shadow-none focus:outline-none focus:ring-0"
            style={{ outline: 'none', boxShadow: 'none' }}
          />
          <div className="flex items-center gap-1.5 shrink-0">
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
            <kbd className="rounded-md border border-slate-200/80 bg-slate-100/80 px-2 py-0.5 text-[10px] font-semibold text-slate-500 shadow-2xs">
              ESC
            </kbd>
          </div>
        </div>

        {/* Results List */}
        <div ref={listRef} className="max-h-[340px] overflow-y-auto p-2">
          {results.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No results found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            <div className="space-y-0.5">
              {results.map((item, index) => {
                const isSelected = index === selectedIndex
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selectItem(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition-all ${
                      isSelected
                        ? 'bg-blue-50 text-[#0071e3] shadow-2xs font-semibold'
                        : 'text-slate-700 hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span
                        className={`rounded-xl p-2 transition-colors ${
                          isSelected ? 'bg-blue-100/80 text-[#0071e3]' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <Icon size={15} strokeWidth={2} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-xs font-semibold">{item.title}</p>
                          <span className="rounded-md bg-slate-100 px-1.5 py-0.2 text-[9px] font-medium text-slate-500">
                            {item.category}
                          </span>
                        </div>
                        <p className="truncate text-[11px] text-slate-400 mt-0.5">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>
                    {isSelected && <CornerDownLeft size={13} className="ml-2 text-[#0071e3] shrink-0" />}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/80 px-4 py-2 text-[11px] text-slate-400">
          <span>Navigate with ↑ ↓ · Press Enter to open</span>
          <span>Marg Search</span>
        </div>
      </div>
    </div>
  )
}
