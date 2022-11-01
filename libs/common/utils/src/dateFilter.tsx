import { useMemo } from 'react'

import { Buffer } from 'buffer'

import { useSearchParams } from 'react-router-dom'

import { DateRange, getDateRangeFilter } from './dateUtil'

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
    const { range, startDate, endDate } = dateFilter

    return {
      dateFilter,
      setDateFilter,
      ...getDateRangeFilter(range, startDate, endDate)
    } as const
  }, [search]) // eslint-disable-line react-hooks/exhaustive-deps
}

function readDateFilter (search: URLSearchParams, setSearch: CallableFunction) {
  const period = search.has('period') && JSON.parse(
    Buffer.from(search.get('period') as string, 'base64').toString('ascii')
  )
  const dateFilter = period
    ? getDateRangeFilter(period.range, period.startDate, period.endDate)
    : getDateRangeFilter(DateRange.last24Hours)

  const setDateFilter = (date: DateFilter) => {
    search.set('period', Buffer.from(JSON.stringify({
      ...date,
      initiated: (new Date()).getTime() // for when we click same relative date again
    })).toString('base64'))
    setSearch(search, { replace: true })
  }
  return { dateFilter, setDateFilter }
}

