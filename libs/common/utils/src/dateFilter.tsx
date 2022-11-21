import { useMemo } from 'react'

import { useSearchParams } from 'react-router-dom'

import { DateRange, getDateRangeFilter } from './dateUtil'
import { encodeURIComponentAndCovertToBase64, decodeBase64String } from '@acx-ui/utils'

export interface DateFilter {
  range: DateRange
  startDate: string
  endDate: string
  initiated?: number // seconds
}

export const useDateFilter = () => {
  const [search, setSearch] = useSearchParams()

  return useMemo(() => {
    const { dateFilter, setDateFilter } = readDateFilter(search, setSearch)

    return {
      dateFilter,
      setDateFilter,
      ...dateFilter
    } as const
  }, [search, setSearch])
}

function readDateFilter (search: URLSearchParams, setSearch: CallableFunction) {
  const period = search.has('period') && JSON.parse(
    decodeBase64String(search.get('period') as string)
  )
  const dateFilter = period
    ? getDateRangeFilter(period.range, period.startDate, period.endDate)
    : getDateRangeFilter(DateRange.last24Hours)

  const setDateFilter = (date: DateFilter) => {
    search.set('period', encodeURIComponentAndCovertToBase64(JSON.stringify({
      ...date,
      initiated: (new Date()).getTime() // for when we click same relative date again
    })))
    setSearch(search, { replace: true })
  }
  return { dateFilter, setDateFilter }
}

