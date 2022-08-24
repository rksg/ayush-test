import React, { ReactNode, useContext, useEffect } from 'react'

import { Buffer } from 'buffer'

import { useSearchParams } from 'react-router-dom'

import { DateFilterContext, getDateRangeFilter, DateFilter } from '@acx-ui/utils'

import type { NetworkPath } from './types/incidents'

interface AnalyticsFilterProps {
  path: NetworkPath
  raw?: object
  setNetworkPath: CallableFunction
  getNetworkFilter: CallableFunction
}
export const defaultNetworkPath: NetworkPath = [{ type: 'network', name: 'Network' }]

export const defaultAnalyticsFilter = {
  path: defaultNetworkPath,
  raw: [],
  setNetworkPath: () => {}, // abstract, comsumer should wrap provider
  getNetworkFilter: () => ({ path: defaultNetworkPath })
} as const

export const AnalyticsFilterContext = React.createContext<AnalyticsFilterProps>(
  defaultAnalyticsFilter
)
export type AnalyticsFilter = DateFilter & { path: NetworkPath }

export function useAnalyticsFilter () {
  const { getNetworkFilter, setNetworkPath } = useContext(AnalyticsFilterContext)
  const { path, raw } = getNetworkFilter()
  const { dateFilter } = useContext(DateFilterContext)
  const { range, startDate, endDate } = dateFilter
  return {
    filters: {
      path: path.length ? path : defaultNetworkPath,
      ...getDateRangeFilter(range, startDate, endDate)
    } as const,
    setNetworkPath,
    raw    
  }
}

export function AnalyticsFilterProvider (props: { children: ReactNode }) {
  const [search, setSearch] = useSearchParams(window.location.search)
  const getNetworkFilter = () => search.has('analyticsNetworkFilter')
    ? JSON.parse(
      Buffer.from(search.get('analyticsNetworkFilter') as string, 'base64').toString('ascii')
    )
    : { path: [], raw: [] }
  
  const setNetworkPath = (networkFilter: NetworkPath, raw: object = []) => {
    search.delete('analyticsNetworkFilter')
    const filter = {
      path: networkFilter,
      raw
    }
    search.append(
      'analyticsNetworkFilter',
      Buffer.from(JSON.stringify(filter)).toString('base64')
    )
    setSearch(search)
  }
  const { path } = getNetworkFilter()
  useEffect(() => {
    if (!path.length) setNetworkPath(defaultNetworkPath)
  }, [path, setNetworkPath])
  const providerValue = { path, setNetworkPath, getNetworkFilter }
  return (
    <AnalyticsFilterContext.Provider
      {...props}
      value={providerValue}
    />
  )
}
