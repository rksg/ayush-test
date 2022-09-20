import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef } from 'react'

import { isEqual } from 'lodash'

import {
  useAnalyticsFilter,
  AnalyticsFilter
} from '@acx-ui/analytics/utils'
import { TimeStamp } from '@acx-ui/types'

export type TimeWindow = [TimeStamp, TimeStamp]

export interface HealthFilter extends AnalyticsFilter {
  timeWindow: TimeWindow
  setTimeWindow: (timeWindow: TimeWindow) => void
}

export const HealthPageContext = createContext(null as unknown as HealthFilter)

export const useHealthFilter = () => {
  const context = useContext(HealthPageContext)
  return context
}

export function HealthPageContextProvider (props: { children: ReactNode }) {
  const analyticsFilter = useAnalyticsFilter()
  const { startDate, endDate } = analyticsFilter.filters
  const timeWindow = useRef<TimeWindow>([startDate, endDate])

  useEffect(() => {
    const nextTimeWindow: TimeWindow = [startDate, endDate]
    if (isEqual(timeWindow.current, nextTimeWindow)) return

    timeWindow.current = nextTimeWindow
  }, [startDate, endDate])

  const setTimeWindow = useCallback((nextTimeWindow: TimeWindow) => {
    timeWindow.current = nextTimeWindow
  }, [])

  const context = useMemo(() => ({
    ...analyticsFilter.filters,
    setTimeWindow,
    timeWindow: timeWindow.current
  }), [analyticsFilter.filters, setTimeWindow, timeWindow])

  return <HealthPageContext.Provider {...props} value={context} />
}
