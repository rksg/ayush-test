import { createContext, ReactNode, useCallback, useEffect, useRef } from 'react'

import { isEqual } from 'lodash'

import {
  useAnalyticsFilter,
  AnalyticsFilter
} from '@acx-ui/analytics/utils'
import { TimeStamp } from '@acx-ui/types'

export type TimeStamps = [TimeStamp, TimeStamp]

export const HealthPageContext = createContext(null as unknown as AnalyticsFilter & {
  timeWindow: TimeStamps
  setTimeWindow: (timeWindow: TimeStamps) => void
})

export function HealthPageContextProvider (props: { children: ReactNode }) {
  const filters = useAnalyticsFilter()
  const timeWindow = useRef<TimeStamps>([filters.startDate, filters.endDate])

  useEffect(() => {
    const nextTimeWindow: TimeStamps = [filters.startDate, filters.endDate]
    if (isEqual(timeWindow.current, nextTimeWindow)) return

    timeWindow.current = nextTimeWindow
  }, [filters.startDate, filters.endDate])

  const setTimeWindow = useCallback((nextTimeWindow: TimeStamps) => {
    timeWindow.current = nextTimeWindow
  }, [])

  const context = { ...filters, setTimeWindow, timeWindow: timeWindow.current }

  return <HealthPageContext.Provider {...props} value={context} />
}
