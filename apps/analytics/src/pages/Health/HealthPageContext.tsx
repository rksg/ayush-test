import { createContext, ReactNode, useCallback, useEffect, useRef } from 'react'

import { isEqual } from 'lodash'

import {
  useAnalyticsFilter,
  AnalyticsFilter
} from '@acx-ui/analytics/utils'
import { TimeStamp } from '@acx-ui/types'

export type TimeWindow = [TimeStamp, TimeStamp]

export const HealthPageContext = createContext(null as unknown as AnalyticsFilter & {
  timeWindow: TimeWindow
  setTimeWindow: (timeWindow: TimeWindow) => void
})

export function HealthPageContextProvider (props: { children: ReactNode }) {
  const filters = useAnalyticsFilter()
  const timeWindow = useRef<TimeWindow>([filters.startDate, filters.endDate])

  useEffect(() => {
    const nextTimeWindow: TimeWindow = [filters.startDate, filters.endDate]
    if (isEqual(timeWindow.current, nextTimeWindow)) return

    timeWindow.current = nextTimeWindow
  }, [filters.startDate, filters.endDate])

  const setTimeWindow = useCallback((nextTimeWindow: TimeWindow) => {
    timeWindow.current = nextTimeWindow
  }, [])

  const context = { ...filters, setTimeWindow, timeWindow: timeWindow.current }

  return <HealthPageContext.Provider {...props} value={context} />
}
