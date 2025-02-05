import { useMemo } from 'react'

import moment              from 'moment'
import { useSearchParams } from 'react-router-dom'

import { DateRangeFilter, DateRange, getDateRangeFilter, dateRangeForLast } from './dateUtil'
import { getIntl }                                                          from './intlUtil'
import { AccountTier, getJwtTokenPayload }                                  from './jwtToken'
import { showToast }                                                        from './Toast'
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
  const { $t } = getIntl()
  const period = read()
  const [, setSearch] = useSearchParams()

  return useMemo(() => {
    const earliestStartData = isDateRangeLimit ?
      (earliestStart || getEarliestStart()) : moment().subtract(3, 'months')
    const isSameOrAfter = period && moment(period.startDate).isSameOrAfter(earliestStartData)
    const dateFilter = isSameOrAfter
      ? getDateRangeFilter(period.range, period.startDate, period.endDate)
      : getDateRangeFilter(DateRange.last24Hours)
    const setDateFilter = (date: DateFilter) => {
      write({
        ...date,
        initiated: (new Date()).getTime() // for when we click same relative date again
      })
    }
    const url = new URL(window.location.href)

    const clearDateFilter = () => {
      const newSearch = new URLSearchParams(window.location.search)
      newSearch.delete('period')
      setSearch(newSearch, { replace: true })
    }

    if(url.searchParams.get('period') && !isSameOrAfter && isDateRangeLimit) {
      clearDateFilter()
      showToast({
        key: 'dateFilterResetToast',
        type: 'success',
        // eslint-disable-next-line max-len
        content: $t(
          // eslint-disable-next-line max-len
          { defaultMessage: 'Note that your Calendar selection has been updated in line with current page default/max values.' }
        )
      })
    }

    return {
      dateFilter,
      setDateFilter,
      ...dateFilter
    } as const
  }, [read, write, period]) // eslint-disable-line react-hooks/exhaustive-deps
  // if we add earliestStart as deps, the date will start sliding again
}