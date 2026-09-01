import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu } from 'lucide-react'
import Sidebar from './Sidebar.jsx'

export default function AppShell() {
  const [open, setOpen] = useState(false)
  return (
    <div className="min-h-screen text-[#172033]">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#e3e8ef] bg-white/90 px-4 backdrop-blur-xl lg:hidden">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-[#e3e8ef]"><img src="/marg-logo.png" alt="" className="h-8 w-8 object-contain" /></span>
          <div><p className="text-lg font-semibold tracking-[-0.035em]">Marg</p><p className="text-[9px] uppercase tracking-[0.16em] text-[#7b879b]">Bengaluru operations</p></div>
        </div>
        <button type="button" onClick={() => setOpen(true)} className="rounded-xl border border-[#dfe5ed] bg-white p-2.5 text-[#344054] shadow-sm" aria-label="Open navigation"><Menu size={19} /></button>
      </header>
      <main className="min-h-screen lg:pl-64">
        <div className="mx-auto max-w-[1680px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8 xl:px-10"><Outlet /></div>
      </main>
    </div>
  )
}
