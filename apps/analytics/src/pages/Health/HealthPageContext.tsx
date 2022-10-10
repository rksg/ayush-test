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

export const isBefore = (a: TimeStamp, b: TimeStamp) => moment(a).isBefore(b)
export const isAfter = (a: TimeStamp, b: TimeStamp) => moment(a).isAfter(b)

export const formatTimeWindow = (window: TimeWindow, defaultWindow: TimeWindow) => {
  if (typeof window[0] === 'number') {
    window[0] = moment(window[0]).format()
  }

  if (typeof window[1] === 'number') {
    window[1] = moment(window[1]).format()
  }

  if (isBefore(window[0], defaultWindow[0])) {
    window[0] = defaultWindow[0]
  }

  if (isAfter(window[1], defaultWindow[1])) {
    window[1] = defaultWindow[1]
  }

  return window
}

export function HealthPageContextProvider (props: { children: ReactNode }) {
  const analyticsFilter = useAnalyticsFilter()
  const { startDate, endDate } = analyticsFilter.filters
  const [timeWindow, setTimeWindow] = useState<TimeWindow>([startDate, endDate])

  const setTimeWindowCallback = useCallback((window: TimeWindow) => {
    const formattedWindow = formatTimeWindow(window, [startDate, endDate])
    setTimeWindow(formattedWindow)
  }, [startDate, endDate])

  useEffect(() => {
    const formattedWindow = formatTimeWindow([startDate, endDate], [startDate, endDate])
    setTimeWindow(formattedWindow)
  }, [startDate, endDate])

  const context = useMemo(() => ({
    ...analyticsFilter.filters,
    setTimeWindow: setTimeWindowCallback,
    timeWindow
  }), [analyticsFilter.filters, setTimeWindowCallback, timeWindow])

  return <HealthPageContext.Provider {...props} value={context} />
}
