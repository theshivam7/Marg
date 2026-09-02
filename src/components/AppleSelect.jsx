import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, Search } from 'lucide-react'

export default function AppleSelect({
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  searchable = true,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const dropdownRef = useRef(null)
  const triggerRef = useRef(null)
  const searchInputRef = useRef(null)
  const listRef = useRef(null)

  const selectedOption = options.find((option) => option.value === value)
  const filteredOptions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return options
    return options.filter((option) =>
      `${option.label} ${option.sublabel || ''}`.toLowerCase().includes(query)
    )
  }, [options, searchQuery])

  const closeMenu = (returnFocus = false) => {
    setIsOpen(false)
    setSearchQuery('')
    if (returnFocus) window.requestAnimationFrame(() => triggerRef.current?.focus())
  }

  const openMenu = () => {
    const selectedIndex = options.findIndex((option) => option.value === value)
    setHighlightedIndex(Math.max(0, selectedIndex))
    setIsOpen(true)
  }

  useEffect(() => {
    if (!isOpen) return undefined

    const handlePointerDown = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) closeMenu()
    }
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeMenu(true)
      }
    }
    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return undefined
    const timer = window.setTimeout(() => {
      if (searchable && options.length > 5) searchInputRef.current?.focus()
      else listRef.current?.focus()
    }, 40)
    return () => window.clearTimeout(timer)
  }, [isOpen, options.length, searchable])

  const chooseOption = (option) => {
    if (!option) return
    onChange(option.value)
    closeMenu(true)
  }

  const handleMenuKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setHighlightedIndex((index) => (index + 1) % Math.max(1, filteredOptions.length))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setHighlightedIndex((index) => (index - 1 + filteredOptions.length) % Math.max(1, filteredOptions.length))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      chooseOption(filteredOptions[highlightedIndex])
    }
  }

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (isOpen ? closeMenu() : openMenu())}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()
            if (!isOpen) openMenu()
          }
        }}
        className="glass-control flex min-h-12 w-full items-center justify-between gap-3 rounded-xl px-3.5 py-2 text-left text-xs font-semibold text-slate-800 hover:text-slate-950 active:scale-[0.99]"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="min-w-0 truncate">
          <span className="block truncate font-semibold text-slate-900">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.sublabel && (
            <span className="mt-0.5 block truncate text-[10px] font-normal text-slate-400">
              {selectedOption.sublabel}
            </span>
          )}
        </span>
        <ChevronDown
          size={14}
          className={`shrink-0 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#0071e3]' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="glass-popover absolute left-0 top-full z-[1000] mt-2 w-full min-w-full overflow-hidden rounded-2xl p-1.5 sm:min-w-[330px]">
          {searchable && options.length > 5 && (
            <div className="relative mb-1.5 px-1 pt-1">
              <Search size={13} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value)
                  setHighlightedIndex(0)
                }}
                onKeyDown={handleMenuKeyDown}
                placeholder="Search camera, area or road"
                aria-label="Search options"
                className="w-full rounded-xl border border-transparent bg-slate-100/80 py-2 pl-8 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:outline-none"
              />
            </div>
          )}

          <div
            ref={listRef}
            role="listbox"
            aria-label="Camera options"
            tabIndex={-1}
            onKeyDown={handleMenuKeyDown}
            className="max-h-72 space-y-0.5 overflow-y-auto pr-0.5 outline-none"
          >
            {filteredOptions.length === 0 ? (
              <p className="p-4 text-center text-xs text-slate-400">No matching camera</p>
            ) : (
              filteredOptions.map((option, index) => {
                const isSelected = option.value === value
                const isHighlighted = index === highlightedIndex
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => chooseOption(option)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs transition-all ${
                      isSelected
                        ? 'bg-blue-50 text-[#0071e3]'
                        : isHighlighted
                          ? 'bg-slate-100/90 text-slate-900'
                          : 'text-slate-700 hover:bg-slate-100/80'
                    }`}
                  >
                    <span className="mr-2 min-w-0 truncate">
                      <span className="block truncate font-semibold">{option.label}</span>
                      {option.sublabel && (
                        <span className={`mt-0.5 block truncate text-[10px] ${isSelected ? 'text-blue-500' : 'text-slate-400'}`}>
                          {option.sublabel}
                        </span>
                      )}
                    </span>
                    {isSelected && <Check size={14} className="shrink-0 text-[#0071e3]" />}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
