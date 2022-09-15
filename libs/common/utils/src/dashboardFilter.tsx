import React, { ReactNode, useContext } from 'react'

import { Buffer } from 'buffer'

import { useSearchParams } from 'react-router-dom'

import { DateFilterContext, getDateRangeFilter, DateFilter } from '@acx-ui/utils'

// import type { NetworkPath } from './types/incidents'

export type NodeType = 'network'
  | 'apGroupName'
  | 'apGroup'
  | 'zoneName'
  | 'zone'
  | 'switchGroup'
  | 'switch'
  | 'apMac'
  | 'ap'
  | 'AP'

export interface PathNode {
  type: NodeType
  name: string
}

export interface NetworkPath extends Array<PathNode> {}

export type NetworkNode = {
  type: Omit<NodeType,'network'>
  name: string
}
export type NetworkNodePath = NetworkNode[] | []


interface AnalyticsFilterProps {
  path: NetworkPath
  setNetworkNodeFilter: CallableFunction
  getNetworkNodeFilter: CallableFunction
  networkNodes: NetworkNodePath
}
export const defaultNetworkPath: NetworkPath = [{ type: 'network', name: 'Network' }]

export const defaultAnalyticsFilter = {
  path: defaultNetworkPath,
  raw: [],
  setNetworkNodeFilter: () => {}, // abstract, comsumer should wrap provider
  getNetworkNodeFilter: () => ({ path: defaultNetworkPath }),
  networkNodes: []
} 

export const AnalyticsFilterContext = React.createContext<AnalyticsFilterProps>(
  defaultAnalyticsFilter
)
export type AnalyticsFilter = DateFilter & { path: NetworkPath }

export function useDashboardFilter () {
  const { getNetworkNodeFilter, setNetworkNodeFilter } = useContext(AnalyticsFilterContext)
  const { networkNodes } = getNetworkNodeFilter()
  const { dateFilter } = useContext(DateFilterContext)
  const { range, startDate, endDate } = dateFilter
  return {
    filters: {
      path: defaultNetworkPath,
      ...getDateRangeFilter(range, startDate, endDate),
      networkNodes
    } as const,
    setNetworkNodeFilter,
  }
}

export function DashboardFilterProvider (props: { children: ReactNode }) {
  const [search, setSearch] = useSearchParams()
  const getNetworkNodeFilter = () => search.has('dashboardVenueFilter')
    ? JSON.parse(
      Buffer.from(search.get('dashboardVenueFilter') as string, 'base64').toString('ascii')
    )
    : { networkNodes: [] }

  const setNetworkNodeFilter = (networkNodes: NetworkPath) => {
    search.set(
      'dashboardVenueFilter',
      Buffer.from(JSON.stringify({ networkNodes })).toString('base64')
    )
    setSearch(search, { replace: true })
  }
  const { networkNodes } = getNetworkNodeFilter()
  const providerValue = {
    path: defaultNetworkPath,
    setNetworkNodeFilter,
    getNetworkNodeFilter,
    networkNodes
  }
  return (
    <AnalyticsFilterContext.Provider
      {...props}
      value={providerValue}
    />
  )
}
