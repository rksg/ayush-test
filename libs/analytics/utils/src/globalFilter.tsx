import React, { ReactNode, useContext } from 'react'

import { pick } from 'lodash'
import moment   from 'moment-timezone'

import { NetworkPath } from './constants'

export enum DateRange {
  today = 'Today',
  last1Hour = 'Last 1 Hour',
  last24Hours = 'Last 24 Hours',
  last7Days = 'Last 7 Days',
  lastMonth = 'Last Month',
  custom = 'Custom'
}

interface DateFilter {
  range: DateRange
}

interface GlobalFilterProps {
  dateFilter: DateFilter
  path: Readonly<NetworkPath>
}

export const defaultGlobalFilter = {
  dateFilter: { range: DateRange.last24Hours },
  path: [{ type: 'network', name: 'Network' }] as NetworkPath
} as const

const GlobalFilterContext = React.createContext<GlobalFilterProps>(defaultGlobalFilter)

export type GlobalFilter = ReturnType<typeof useGlobalFilter>

export function useGlobalFilter () {
  const { dateFilter, ...filters } = useContext(GlobalFilterContext)
  return {
    ...filters,
    ...getDateRangeFilter(dateFilter)
  } as const
}

export function GlobalFilterProvider (props: { children: ReactNode }) {
  // TODO:
  // Expose methods to change global filters
  return <GlobalFilterContext.Provider {...props} value={defaultGlobalFilter} />
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
  // TODO:
  // instead of generating all ranges, maybe generate only what is given at `dateFilter.range`?
  const ranges = defaultRanges()
  const [startDate, endDate] = (
    ranges as Record<string, [moment.Moment, moment.Moment]>
  )[range].map((date: moment.Moment) => date.format())
  return { startDate, endDate }
}
