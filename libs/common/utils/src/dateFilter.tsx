import { useMemo } from 'react'

import moment from 'moment-timezone'

import { DateRangeFilter, DateRange, getDateRangeFilter } from './dateUtil'
import { useEncodedParameter }                            from './useEncodedParameter'

import type { Moment } from 'moment-timezone'

export interface DateFilter extends DateRangeFilter {
  initiated?: number // seconds
}

export const useDateFilter = (
  earliestStart: Moment = moment().subtract(3, 'months').subtract(1, 'hour')
) => {
  const { read, write } = useEncodedParameter<DateFilter>('period')
  return useMemo(() => {
    const period = read()
    const dateFilter = period && moment(period.startDate).isAfter(earliestStart)
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
  }, [read, write]) // eslint-disable-line react-hooks/exhaustive-deps
  // if we add earliestStart as deps, the date will start sliding again
}
