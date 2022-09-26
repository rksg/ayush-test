import React, { ReactNode, useContext } from 'react'

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
export type pathFilter = {
  networkNodes? : NetworkPath[],
  switchNodes? : NetworkPath[]
}

export const defaultAnalyticsFilter = {
  path: defaultNetworkPath,
  raw: [],
  setNetworkPath: () => {}, // abstract, comsumer should wrap provider
  getNetworkFilter: () => ({ path: defaultNetworkPath })
} as const

export const AnalyticsFilterContext = React.createContext<AnalyticsFilterProps>(
  defaultAnalyticsFilter
)
export type AnalyticsFilter = DateFilter & { path: NetworkPath } & { filter? : pathFilter }

export function useAnalyticsFilter () {
  const { getNetworkFilter, setNetworkPath } = useContext(AnalyticsFilterContext)
  const { path, raw } = getNetworkFilter()
  const { dateFilter } = useContext(DateFilterContext)
  const { range, startDate, endDate } = dateFilter
  const selectedNode = path.length > 1 ? [path.slice(1)] : []
  return {
    filters: {
      path: defaultNetworkPath,
      ...getDateRangeFilter(range, startDate, endDate),
      filter: { networkNodes: selectedNode, switchNodes: selectedNode } 
    } as const,
    setNetworkPath,
    raw
  }
}

export function AnalyticsFilterProvider (props: { children: ReactNode }) {
  const [search, setSearch] = useSearchParams()
  const getNetworkFilter = () => search.has('analyticsNetworkFilter')
    ? JSON.parse(
      Buffer.from(search.get('analyticsNetworkFilter') as string, 'base64').toString('ascii')
    )
    : { path: [], raw: [] }

  const setNetworkPath = (path: NetworkPath, raw: object) => {
    search.set(
      'analyticsNetworkFilter',
      Buffer.from(JSON.stringify({ path, raw })).toString('base64')
    )
    setSearch(search, { replace: true })
  }
  const { path } = getNetworkFilter()
  const providerValue = {
    path: path.length ? path : defaultNetworkPath,
    setNetworkPath,
    getNetworkFilter
  }
  return (
    <AnalyticsFilterContext.Provider
      {...props}
      value={providerValue}
    />
  )
}
