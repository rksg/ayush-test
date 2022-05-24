import React from 'react'

import moment from 'moment-timezone'

import * as constants from './constants'

export const getDateFilter = (dateFilter: DateFilter) => {
  const range = dateFilter.range
  const ranges = constants.ranges()
  const [startDate, endDate] = (
    ranges as Record<string, [moment.Moment, moment.Moment]>
  )[range].map((date: moment.Moment) => date.format())
  return { ...dateFilter, startDate, endDate }
}

export interface Path {
  [index: number]: { type: string; name: string }
}
interface DateFilter {
  range: string
}
export interface GlobalFilterProps {
  dateFilter: DateFilter
  path: Path
}

export const defaultGlobalFilter = {
  dateFilter: { range: constants.last24Hours },
  path: [{ type: 'network', name: 'Network' }]
}
export const GlobalFilterContext = React.createContext(defaultGlobalFilter)
