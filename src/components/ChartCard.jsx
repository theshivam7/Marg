export default function ChartCard({ title, description, action, children, className = '' }) {
  return (
    <section className={`panel p-4 sm:p-5 flex flex-col justify-between ${className}`}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            {title}
          </h2>
          {description && (
            <p className="mt-0.5 text-xs text-slate-500">
              {description}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="flex-1 min-h-0 w-full">{children}</div>
    </section>
  )
}
