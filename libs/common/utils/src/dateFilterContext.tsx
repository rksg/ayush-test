import { useMemo } from 'react'

import { Buffer } from 'buffer'

import { useSearchParams } from 'react-router-dom'

import { DateRange, getDateRangeFilter } from './dateUtil'
export type DateFilterContextprops = {
  dateFilter: DateFilter,
  setDateFilter?: (c: DateFilter) => void
}
export interface DateFilter {
  range: DateRange;
  startDate: string;
  endDate: string;
}

export const defaultDateFilter = () => ({
  dateFilter: { ...getDateRangeFilter(DateRange.last24Hours) }
} as const)

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
  }, [search, setSearch])
}

function readDateFilter (search: URLSearchParams, setSearch: CallableFunction) {
  const period = search.has('period') && JSON.parse(
    Buffer.from(search.get('period') as string, 'base64').toString('ascii')
  )
  const dateFilter = period
    ? getDateRangeFilter(period.range, period.startDate, period.endDate)
    : defaultDateFilter().dateFilter

  const setDateFilter = (date: DateFilter) => {
    search.set('period', Buffer.from(JSON.stringify(date)).toString('base64'))
    setSearch(search, { replace: true })
  }
  return { dateFilter, setDateFilter }
}

