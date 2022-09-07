import {
  createContext,
  useContext,
  useMemo,
  ReactNode
} from 'react'

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

export const defaultDateFilter = {
  dateFilter: { ...getDateRangeFilter(DateRange.last24Hours) }
} as const

export const DateFilterContext =
  createContext<DateFilterContextprops>(defaultDateFilter)

export const useDateFilter = () => {
  const { dateFilter, setDateFilter } = useContext(DateFilterContext)
  const { range, startDate, endDate } = dateFilter
  return {
    setDateFilter,
    ...getDateRangeFilter(range, startDate, endDate)
  } as const
}

export function DateFilterProvider (props: { children: ReactNode }) {
  const [search, setSearch] = useSearchParams()
  const period = search.has('period') && JSON.parse(
    Buffer.from(search.get('period') as string, 'base64').toString('ascii')
  )
  const providerValue = useMemo(() => ({
    dateFilter: period
      ? getDateRangeFilter(period.range, period.startDate, period.endDate)
      : defaultDateFilter.dateFilter,
    setDateFilter: (date: DateFilter) => {
      search.set('period', Buffer.from(JSON.stringify({ ...date })).toString('base64'))
      setSearch(search)
    }
  }), [search]) // eslint-disable-line react-hooks/exhaustive-deps
  return <DateFilterContext.Provider {...props} value={providerValue} />
}
