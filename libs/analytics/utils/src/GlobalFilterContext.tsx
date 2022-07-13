import { createContext, useContext,ReactNode, useState } from 'react'

import { pick } from 'lodash'
import moment   from 'moment-timezone'
interface DateFilter {
  range: DateRange
}
export type DateFilterContextprops = {
  dateFilter: DateFilter
  setDateFilter:(c: DateFilter) => void
}
export enum DateRange {
  today = 'Today',
  last1Hour = 'Last 1 Hour',
  last24Hours = 'Last 24 Hours',
  last7Days = 'Last 7 Days',
  lastMonth = 'Last Month',
  custom = 'Custom'
}

export const defaultDateFilter = {
  dateFilter: { range: DateRange.last24Hours },
  setDateFilter: () => {}
} as const
export const DateFilterContext = createContext<DateFilterContextprops>(defaultDateFilter)
export const useDateFilter = () => {
  const { dateFilter, ...filters } = useContext(DateFilterContext)
  return {
    ...filters,
    ...getDateRangeFilter(dateFilter)
  } as const
}

export function DateFilterProvider (props: { children: ReactNode }) {
  const [dateFilter, setDateFilter] = useState<DateFilter>(defaultDateFilter.dateFilter)
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

export function getDateRangeFilter ({ range }: DateFilter) {
  const ranges = defaultRanges()
  const [startDate, endDate] = (
    ranges as Record<string, [moment.Moment, moment.Moment]>
  )[range].map((date: moment.Moment) => date.format())
  return { startDate, endDate }
}

