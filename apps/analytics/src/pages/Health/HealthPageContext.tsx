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

const isBefore = (a: TimeStamp, b: TimeStamp) => moment(a).isBefore(b)

export const formatTimeWindow = (window: TimeStampRange) : TimeStampRange => window
  .sort((a, b) => isBefore(a, b) ? -1 : 1)
  .map(t => moment(t).utc().toISOString()) as TimeStampRange

export function HealthPageContextProvider (props: { children: ReactNode }) {
  const analyticsFilter = useAnalyticsFilter()
  const { startDate, endDate } = analyticsFilter.filters
  const [timeWindow, setTimeWindow] = useState<TimeStampRange>([
    moment(startDate).utc().toISOString(),
    moment(endDate).utc().toISOString()
  ])
  const setTimeWindowCallback = useCallback((window: TimeStampRange, isReset?: boolean) => {
    const formattedWindow = formatTimeWindow(isReset ? [startDate, endDate] : window)
    setTimeWindow(formattedWindow)
  }, [startDate, endDate])

  useEffect(() => {
    const formattedWindow = formatTimeWindow([startDate, endDate])
    setTimeWindow(formattedWindow)
  }, [startDate, endDate])

  const context = useMemo(() => ({
    ...analyticsFilter.filters,
    setTimeWindow: setTimeWindowCallback,
    timeWindow
  }), [analyticsFilter.filters, setTimeWindowCallback, timeWindow])

  return <HealthPageContext.Provider {...props} value={context} />
}
