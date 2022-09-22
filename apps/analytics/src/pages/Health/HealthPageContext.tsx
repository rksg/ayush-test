import { createContext, ReactNode, useEffect, useMemo, useState } from 'react'

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

export function HealthPageContextProvider (props: { children: ReactNode }) {
  const analyticsFilter = useAnalyticsFilter()
  const { startDate, endDate } = analyticsFilter.filters
  const [timeWindow, setTimeWindow] = useState<TimeWindow>([startDate, endDate])

  useEffect(() => {
    setTimeWindow([startDate, endDate])
  }, [startDate, endDate])

  const context = useMemo(() => ({
    ...analyticsFilter.filters,
    setTimeWindow,
    timeWindow
  }), [analyticsFilter.filters, setTimeWindow, timeWindow])

  return <HealthPageContext.Provider {...props} value={context} />
}
