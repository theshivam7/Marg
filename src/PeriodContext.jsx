/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from 'react'

const PeriodContext = createContext(null)

export function PeriodProvider({ children }) {
  const [period, setPeriod] = useState('today')
  const value = useMemo(() => ({ period, setPeriod }), [period])
  return <PeriodContext.Provider value={value}>{children}</PeriodContext.Provider>
}

export function usePeriod() {
  const context = useContext(PeriodContext)
  if (!context) throw new Error('usePeriod must be used within PeriodProvider')
  return context
}
