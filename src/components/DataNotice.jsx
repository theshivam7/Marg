import { Activity, Clock3, MapPinned } from 'lucide-react'

export default function DataNotice({ compact = false }) {
  return (
    <div className={`flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-[#dfe6ef] bg-white text-[#647188] shadow-[0_1px_2px_rgba(15,23,42,0.02)] ${compact ? 'px-3.5 py-2.5 text-[10px]' : 'px-4 py-3 text-[11px]'}`}>
      <span className="flex items-center gap-2 font-semibold text-[#273449]"><Activity size={14} className="text-[#0f9f8f]" />Scenario workspace</span>
      <span className="flex items-center gap-1.5"><MapPinned size={13} />Bengaluru network</span>
      <span className="flex items-center gap-1.5"><Clock3 size={13} />Updated 20:30 IST</span>
      <span className="ml-auto hidden items-center gap-1.5 font-medium text-[#0d8d80] sm:flex"><span className="h-1.5 w-1.5 rounded-full bg-[#19a98e]" />Processing normally</span>
    </div>
  )
}
