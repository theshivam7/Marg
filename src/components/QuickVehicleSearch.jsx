import { ArrowRight, Search } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { normalizePlate } from '../utils/vehicleTracking.js'

const quickPlates = ['KA01AB1234', 'KA03MN4582', 'KA09ZX4481']

export default function QuickVehicleSearch() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const submit = (event) => {
    event.preventDefault()
    const plate = normalizePlate(query)
    if (plate) navigate(`/tracker?plate=${plate}`)
  }

  return (
    <section className="panel mb-6 flex flex-col gap-4 border-[#dbe5f3] bg-[linear-gradient(105deg,#ffffff_0%,#f5f9ff_100%)] p-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0">
        <p className="text-xs font-semibold text-[#273449]">Track a vehicle across the network</p>
        <p className="mt-1 text-[11px] text-[#748096]">Open its camera-by-camera route and detection history.</p>
      </div>
      <form onSubmit={submit} className="flex min-w-0 flex-1 gap-2 lg:max-w-xl">
        <div className="relative min-w-0 flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8996a9]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value.toUpperCase())}
            placeholder="Enter number plate"
            aria-label="Quick vehicle plate search"
            className="w-full rounded-xl border border-[#dce3ec] bg-white py-2.5 pl-9 pr-3 text-xs font-semibold uppercase tracking-[0.06em] text-[#263247] placeholder:text-[#9aa5b5]"
          />
        </div>
        <button type="submit" className="flex items-center gap-1.5 rounded-xl bg-[#2563eb] px-4 py-2.5 text-xs font-semibold text-white shadow-[0_5px_15px_rgba(37,99,235,0.2)] transition-colors hover:bg-[#1d4ed8]">Track<ArrowRight size={14} /></button>
      </form>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#8996a9]">Try</span>
        {quickPlates.map((plate) => <button key={plate} type="button" onClick={() => navigate(`/tracker?plate=${plate}`)} className="rounded-lg border border-[#e1e7ef] bg-white px-2.5 py-1.5 text-[9px] font-semibold text-[#526176] transition-colors hover:border-[#b8ccf4] hover:text-[#2563eb]">{plate}</button>)}
      </div>
    </section>
  )
}
