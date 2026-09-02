export default function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
      <div>
        {eyebrow && (
          <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-600">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-0.5 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-500">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  )
}
