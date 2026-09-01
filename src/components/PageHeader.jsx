export default function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
      <div>
        <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#2563eb]">{eyebrow}</p>
        <h1 className="text-[32px] font-semibold leading-tight tracking-[-0.045em] text-[#152033] sm:text-[38px]">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#69758a]">{description}</p>
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  )
}
