import { createContext, ReactNode, useCallback, useEffect, useMemo, useState } from 'react'

import moment from 'moment-timezone'

import {
  useAnalyticsFilter,
  AnalyticsFilter
} from '@acx-ui/analytics/utils'
import { TimeStamp, TimeStampRange } from '@acx-ui/types'


export interface HealthFilter extends AnalyticsFilter {
  timeWindow: TimeStampRange
  setTimeWindow: (timeWindow: TimeStampRange, isReset?: boolean) => void
}

export const HealthPageContext = createContext(null as unknown as HealthFilter)

export const isBefore = (a: TimeStamp, b: TimeStamp) => moment(a).isBefore(b)
export const isAfter = (a: TimeStamp, b: TimeStamp) => moment(a).isAfter(b)

let maxWindow: TimeStampRange = ['', '']

export const formatTimeWindow = (window: TimeStampRange, defaultWindow: TimeStampRange, isReset: boolean) : TimeStampRange => {
  const newWindow = window
    .sort((a, b) => +isBefore(a, b))
    .map(t => moment(t).utc().toISOString()) as TimeStampRange
  if (isReset) {
    maxWindow = [
      isBefore(maxWindow[0], newWindow[0]) ? maxWindow[0] : newWindow[0],
      isAfter(maxWindow[1], newWindow[1]) ? maxWindow[1] : newWindow[1]
    ]
    return maxWindow
  }
  return newWindow
}

export function HealthPageContextProvider (props: { children: ReactNode }) {
  const analyticsFilter = useAnalyticsFilter()
  const { startDate, endDate } = analyticsFilter.filters
  const [timeWindow, setTimeWindow] = useState<TimeStampRange>([
    moment(startDate).utc().toISOString(),
    moment(endDate).utc().toISOString()
  ])
  const setTimeWindowCallback = useCallback((window: TimeStampRange, isReset?: boolean) => {
    const formattedWindow = formatTimeWindow(window, timeWindow, isReset || false)
    setTimeWindow(formattedWindow)
  }, [startDate, endDate])

  useEffect(() => {
    setTimeWindowCallback([startDate, endDate], false)
  }, [startDate, endDate, setTimeWindowCallback])

  const context = useMemo(() => ({
    ...analyticsFilter.filters,
    setTimeWindow: setTimeWindowCallback,
    timeWindow
  }), [analyticsFilter.filters, setTimeWindowCallback, timeWindow])

  return <HealthPageContext.Provider {...props} value={context} />
}
