import { useMemo } from 'react'

import moment from 'moment-timezone'

import { DateRangeFilter, DateRange, getDateRangeFilter, dateRangeForLast } from './dateUtil'
import { AccountTier, getJwtTokenPayload }                                  from './jwtToken'
import { useEncodedParameter }                                              from './useEncodedParameter'

import type { Moment } from 'moment-timezone'

export interface DateFilter extends DateRangeFilter {
  initiated?: number // seconds
}

export function getEarliestStart () {
  const { acx_account_tier: accountTier } = getJwtTokenPayload()
  const allowedDateRange = (accountTier === AccountTier.GOLD
    ? dateRangeForLast(1,'month')
    : dateRangeForLast(3,'months')
  )
  return allowedDateRange[0].startOf('day')
}

export const useDateFilter = ({
  earliestStart = undefined,
  isDateRangeLimit = false
}: {
  earliestStart?: Moment;
  isDateRangeLimit?: boolean;
} = {})=> {
  const { read, write } = useEncodedParameter<DateFilter>('period')
  return useMemo(() => {
    const period = read()
    const earliestStartData = isDateRangeLimit ?
      (earliestStart || getEarliestStart()) : moment().subtract(3, 'months')
    const dateFilter = period && moment(period.startDate).isSameOrAfter(earliestStartData)
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
