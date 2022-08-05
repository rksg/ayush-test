import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useRef,
  useMemo
} from 'react'

import { Buffer } from 'buffer'

import { useSearchParams } from 'react-router-dom'

import { DateRange, getDateRangeFilter } from './dateUtil'
export type DateFilterContextprops = {
  dateFilter: DateFilter,
  setDateFilter?: (c: DateFilter) => void
}
interface DateFilter {
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
  const didMountRef = useRef(false)

  const period = search.has('period')
    ? JSON.parse(
      Buffer.from(search.get('period') as string, 'base64').toString('ascii')
    )
    : {}
  const defaultFilter = search.has('period')
    ? getDateRangeFilter(period.range, period.startDate, period.endDate)
    : defaultDateFilter.dateFilter

  const [dateFilter, setDateFilter] = useState<DateFilter>(defaultFilter)

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true
      return
    }
    const params = new URLSearchParams()
    params.append(
      'period',
      Buffer.from(JSON.stringify({ ...dateFilter })).toString('base64')
    )
    setSearch(params)
  }, [dateFilter, setSearch])
  const providerValue = useMemo(
    () => ({ dateFilter, setDateFilter }),
    [dateFilter, setDateFilter]
  )
  return <DateFilterContext.Provider {...props} value={providerValue} />
}

