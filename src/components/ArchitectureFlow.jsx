import { ArrowRight, Camera, ChartNoAxesCombined, Database, LayoutDashboard, ScanSearch, Waypoints } from 'lucide-react'

const production = [
  ['CCTV Cameras', Camera], ['VideoDB', Database], ['Detection + ANPR', ScanSearch], ['Detection Events', Waypoints], ['Trajectory Engine', Waypoints], ['Traffic Analytics', ChartNoAxesCombined], ['Dashboard', LayoutDashboard],
]

export default function ArchitectureFlow() {
  return (
    <section className="panel subtle-grid overflow-hidden p-5 sm:p-6">
      <div className="mb-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#2563eb]">System architecture</p>
        <h2 className="mt-2 text-lg font-semibold tracking-[-0.03em]">From camera streams to city intelligence</h2>
        <p className="mt-1.5 max-w-3xl text-xs leading-5 text-[#748096]">VideoDB processes camera streams into detection and ANPR events used by the trajectory and analytics layers.</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {production.map(([label, Icon], index) => (
          <div key={label} className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-xl border border-[#dfe5ed] bg-white px-3 py-2.5 text-xs font-medium text-[#46556b]"><Icon size={15} className="text-[#2563eb]" />{label}</div>
            {index < production.length - 1 && <ArrowRight size={15} className="text-[#9aa5b5]" />}
          </div>
        ))}
      </div>
    </section>
  )
}
