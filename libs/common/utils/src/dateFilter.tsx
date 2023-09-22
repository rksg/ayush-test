import { useMemo } from 'react'

import { DateRange, getDateRangeFilter } from './dateUtil'
import { useEncodedParameter }           from './encodedParameter'

export interface DateFilter {
  range: DateRange
  startDate: string
  endDate: string
  initiated?: number // seconds
}

export const useDateFilter = ( isDashBoard?: boolean) => {
  const { read, write } = useEncodedParameter<DateFilter>('period')
  return useMemo(() => {
    const period = read()
    const defaultRange = isDashBoard ? DateRange.last8Hours : DateRange.last24Hours
    let adjustedRange
    if(period && period.range !== DateRange.last8Hours)
      adjustedRange =period.range
    else {
      adjustedRange = isDashBoard ? DateRange.last8Hours : DateRange.last24Hours
    }
    const dateFilter = period
      ? getDateRangeFilter(adjustedRange, period.startDate, period.endDate)
      : getDateRangeFilter(defaultRange)

    const setDateFilter = (date: DateFilter) => {
      write({
        ...date,
        initiated: (new Date()).getTime() // for when we click same relative date again
      })
    }

    return {
      dateFilter,
      setDateFilter,
      ...dateFilter
    } as const
  }, [read, write, isDashBoard])
}
