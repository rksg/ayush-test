import { createContext, ReactNode, useCallback, useEffect, useMemo, useState } from 'react'

import moment from 'moment-timezone'

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

export const formatTimeWindow = (window: TimeWindow) => {
  if (typeof window[0] === 'number') {
    window[0] = moment(window[0]).format()
  }

  if (typeof window[1] === 'number') {
    window[1] = moment(window[1]).format()
  }
  
  return window
}

export function HealthPageContextProvider (props: { children: ReactNode }) {
  const analyticsFilter = useAnalyticsFilter()
  const { startDate, endDate } = analyticsFilter.filters
  const [timeWindow, setTimeWindow] = useState<TimeWindow>([startDate, endDate])

  const setTimeWindowCallback = useCallback((window: TimeWindow) => {
    const formattedWindow = formatTimeWindow(window)
    setTimeWindow(formattedWindow)
  }, [])

  useEffect(() => {
    setTimeWindowCallback([startDate, endDate])
  }, [startDate, endDate, setTimeWindowCallback])

  const context = useMemo(() => ({
    ...analyticsFilter.filters,
    setTimeWindow: setTimeWindowCallback,
    timeWindow
  }), [analyticsFilter.filters, setTimeWindowCallback, timeWindow])

  return <HealthPageContext.Provider {...props} value={context} />
}
