import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import {
  Bell,
  ChartNoAxesCombined,
  Map,
  Menu,
  PanelLeft,
  Radar,
  Search,
} from 'lucide-react'
import Sidebar from './Sidebar.jsx'
import CommandPalette from './CommandPalette.jsx'
import PeriodFilter from './PeriodFilter.jsx'
import MargLogo from './MargLogo.jsx'

const pageTitles = {
  '/': { title: 'Overview', icon: Radar },
  '/map': { title: 'City Map', icon: Map },
  '/tracker': { title: 'Vehicle Tracker', icon: Search },
  '/analytics': { title: 'Analytics', icon: ChartNoAxesCombined },
  '/alerts': { title: 'Alerts', icon: Bell },
}

export default function AppShell() {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('marg_sidebar_collapsed') === 'true'
    } catch {
      return false
    }
  })
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)

  const activePage = pageTitles[location.pathname] || pageTitles['/']
  const PageIcon = activePage.icon

  useEffect(() => {
    try {
      localStorage.setItem('marg_sidebar_collapsed', String(sidebarCollapsed))
    } catch {
      // The layout still works when browser storage is unavailable.
    }
  }, [sidebarCollapsed])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen((prev) => !prev)
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        const target = e.target
        if (target instanceof HTMLElement && target.matches('input, textarea, select, [contenteditable="true"]')) {
          return
        }
        e.preventDefault()
        setSidebarCollapsed((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] antialiased flex flex-col">
      <CommandPalette isOpen={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />

      <Sidebar
        open={sidebarOpen}
        collapsed={sidebarCollapsed}
        onClose={() => setSidebarOpen(false)}
      />

      <div
        className={`flex flex-1 flex-col transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'lg:pl-0' : 'lg:pl-64'
        }`}
      >
        {/* Apple-Style Navigation Top Bar */}
        <header className="glass-header sticky top-0 z-30 flex min-h-14 flex-wrap items-center justify-between gap-2 border-b border-black/[0.06] px-3 py-2 sm:min-h-16 sm:px-6 lg:px-8">
          {/* Left section: Sidebar Toggle & Context Breadcrumb */}
          <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
            {/* Mobile Hamburger Drawer Trigger */}
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl border border-slate-200/80 bg-white p-2 text-slate-700 shadow-2xs lg:hidden hover:bg-slate-50 active:scale-95 transition-all"
              aria-label="Open navigation menu"
            >
              <Menu size={17} />
            </button>

            {/* Desktop Sidebar Toggle Button (Full Screen Switch) */}
            <button
              type="button"
              onClick={() => setSidebarCollapsed((prev) => !prev)}
              className="hidden lg:flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white/90 p-2 text-slate-600 shadow-2xs hover:border-slate-300 hover:bg-slate-100/70 hover:text-slate-900 active:scale-95 transition-all"
              title={sidebarCollapsed ? 'Show Sidebar (⌘B)' : 'Hide Sidebar / Full Screen (⌘B)'}
              aria-label="Toggle sidebar collapse"
            >
              <PanelLeft size={16} />
            </button>

            {/* Logo shown in header only when sidebar is collapsed */}
            {sidebarCollapsed && (
              <div className="hidden lg:flex items-center gap-2.5 animate-in fade-in duration-200">
                <MargLogo size={28} />
                <span className="text-sm font-bold text-slate-900">Marg</span>
                <span className="text-slate-300">/</span>
              </div>
            )}

            {/* Active Page Context Breadcrumb */}
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 min-w-0">
              <span className="hidden sm:inline-flex rounded-lg bg-slate-100 p-1 text-slate-500">
                <PageIcon size={14} />
              </span>
              <span className="truncate">{activePage.title}</span>
            </div>
          </div>

          {/* Right section: Spotlight Search Trigger & Timeframe Segmented Control */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Spotlight Search Shortcut Button */}
            <button
              type="button"
              onClick={() => setCommandPaletteOpen(true)}
              className="glass-control flex h-9 w-28 sm:w-56 items-center justify-between rounded-xl px-3 text-xs text-slate-500 hover:text-slate-800 active:scale-[0.99]"
              aria-label="Open global search"
            >
              <div className="flex items-center gap-2 truncate">
                <Search size={14} className="text-slate-400 shrink-0" />
                <span className="truncate hidden sm:inline">Search (⌘K)...</span>
                <span className="truncate sm:hidden">Search...</span>
              </div>
              <kbd className="hidden sm:inline-block rounded-md border border-slate-200/90 bg-white px-1.5 py-0.2 text-[9px] font-semibold text-slate-400 shadow-2xs">
                ⌘K
              </kbd>
            </button>

          </div>

          {/* Timeframe Filter: a second row on narrow screens, inline on desktop. */}
          <div className="order-3 w-full overflow-hidden md:order-none md:w-auto">
            <PeriodFilter />
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-[1560px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
