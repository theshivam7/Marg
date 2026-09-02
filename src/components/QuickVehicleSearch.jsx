import { ArrowRight, Search } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { normalizePlate } from '../utils/vehicleTracking.js'

const quickPlates = ['KA01AB1234', 'KA03MN4582', 'KA09ZX4481', 'KA05TR9021']

export default function QuickVehicleSearch() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const submit = (event) => {
    event.preventDefault()
    const plate = normalizePlate(query)
    if (plate) navigate(`/tracker?plate=${plate}`)
  }

  return (
    <section className="panel grid gap-4 p-4 sm:p-5 xl:grid-cols-[minmax(190px,0.55fr)_minmax(0,1.45fr)] xl:items-center">
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-900">
          Track a vehicle across Bengaluru
        </p>
        <p className="mt-0.5 text-xs text-slate-500">
          Reconstruct time-ordered route history and camera sightings.
        </p>
      </div>

      <div className="flex min-w-0 flex-col items-stretch gap-3 lg:flex-row lg:items-center lg:justify-end">
        <form onSubmit={submit} className="flex min-w-0 gap-2 lg:w-[330px]">
          <div className="relative min-w-0 flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value.toUpperCase())}
              placeholder="e.g. KA01AB1234"
              aria-label="Quick vehicle plate search"
              className="w-full rounded-xl border border-slate-200/90 bg-slate-100/80 py-2 pl-8.5 pr-3 text-xs font-semibold uppercase text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
            />
          </div>
          <button
            type="submit"
            className="btn-primary group shrink-0"
          >
            Track <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
          </button>
        </form>

        <div className="flex min-w-0 items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 sm:flex-wrap lg:justify-end">
          <span className="text-[11px] text-slate-400 shrink-0">Try:</span>
          {quickPlates.map((plate) => (
            <button
              key={plate}
              type="button"
              onClick={() => navigate(`/tracker?plate=${plate}`)}
              className="shrink-0 rounded-lg border border-slate-200/80 bg-white px-2 py-1 text-[11px] font-medium text-slate-600 hover:border-blue-500 hover:text-[#0071e3] hover:shadow-2xs active:scale-95 transition-all"
            >
              {plate}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
