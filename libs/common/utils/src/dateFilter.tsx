import { useMemo } from 'react'

import { DateRangeFilter, DateRange, getDateRangeFilter } from './dateUtil'
import { useEncodedParameter }                            from './encodedParameter'

export interface DateFilter extends DateRangeFilter {
  initiated?: number // seconds
}

export const useDateFilter = () => {
  const { read, write } = useEncodedParameter<DateFilter>('period')

  return useMemo(() => {
    const period = read()
    const dateFilter = period
      ? getDateRangeFilter(period.range, period.startDate, period.endDate)
      : getDateRangeFilter(DateRange.last24Hours)

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
  }, [read, write])
}
