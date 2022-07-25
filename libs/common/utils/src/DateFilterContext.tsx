import { createContext, useContext,ReactNode, useState, useEffect, useRef } from 'react'

import { Buffer } from 'buffer'

import { pick }            from 'lodash'
import moment              from 'moment-timezone'
import { useSearchParams } from 'react-router-dom'
export type DateFilterContextprops = {
  dateFilter: DateFilter,
  setDateFilter?: (c: DateFilter) => void
}
export enum DateRange {
  today = 'Today',
  last1Hour = 'Last 1 Hour',
  last24Hours = 'Last 24 Hours',
  last7Days = 'Last 7 Days',
  lastMonth = 'Last Month',
  custom = 'Custom'
}
interface DateFilter {
  range:DateRange
  startDate: string,
  endDate: string
}
export const defaultDateFilter = {
  dateFilter: { ...getDateRangeFilter(DateRange.last24Hours) }
} as const
export const DateFilterContext = createContext<DateFilterContextprops>(defaultDateFilter)
export const useDateFilter = () => {
  const { dateFilter, setDateFilter } = useContext(DateFilterContext)
  const { range, startDate, endDate } = dateFilter
  return {
    setDateFilter,
    ...getDateRangeFilter(range, startDate, endDate)
  } as const
}
export function DateFilterProvider (props: { children: ReactNode }) {
  const [search,setSearch] = useSearchParams()
  const didMountRef = useRef(false)
  const period = search.has('period') 
    ? JSON.parse(Buffer.from(search.get('period') as string,'base64').toString('ascii')) : {}
  const defaultFilter = search.has('period') 
    ? getDateRangeFilter(period.range, period.startDate, period.endDate) 
    : defaultDateFilter.dateFilter

  const [dateFilter, setDateFilter] = useState<DateFilter>(defaultFilter)
  useEffect(()=>{
    if (!didMountRef.current) {
      didMountRef.current = true
      return
    }
    const params = new URLSearchParams()
    params.append('period',Buffer.from(JSON.stringify({ ...dateFilter })).toString('base64'))
    setSearch(params)
  },[dateFilter, setSearch])
  return <DateFilterContext.Provider {...props} value={{ dateFilter, setDateFilter }} />
}
export function defaultRanges (subRange?: DateRange[]) {
  const defaultRange: Partial<{ [key in DateRange]: moment.Moment[] }> = {
    [DateRange.last1Hour]: [
      moment().subtract(1, 'hours').seconds(0),
      moment().seconds(0)
    ],
    [DateRange.today]: [moment().startOf('day').seconds(0), moment().seconds(0)],
    [DateRange.last24Hours]: [
      moment().subtract(1, 'days').seconds(0),
      moment().seconds(0)
    ],
    [DateRange.last7Days]: [moment().subtract(7, 'days').seconds(0), moment().seconds(0)],
    [DateRange.lastMonth]: [
      moment().subtract(1, 'month').seconds(0),
      moment().seconds(0)
    ]
  }
  if (subRange) {
    return pick(defaultRange, subRange)
  }
  return defaultRange
}

export function getDateRangeFilter ( range : DateRange, start?: string, end? : string) {
  const ranges = defaultRanges()
  const [startDate, endDate] = (range === DateRange.custom && start && end) ? [start, end] : (
    ranges as Record<string, [moment.Moment, moment.Moment]>
  )[range].map((date: moment.Moment) => date.format() )
  return { startDate, endDate, range }
}

