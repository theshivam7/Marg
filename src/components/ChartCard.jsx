export default function ChartCard({ title, description, action, className = '', children }) {
  return (
    <section className={`panel p-5 sm:p-6 ${className}`}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[15px] font-semibold tracking-[-0.015em] text-[#1d2939]">{title}</h2>
          {description && <p className="mt-1 text-[11px] leading-5 text-[#748096]">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}
