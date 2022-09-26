import React, { ReactNode, useContext } from 'react'

import { Buffer } from 'buffer'

import { useSearchParams } from 'react-router-dom'

import { DateFilterContext, DateFilter } from './dateFilterContext'
import {  getDateRangeFilter }           from './dateUtil'

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

export type pathFilter = {
  networkNodes? : NetworkPath[],
  switchNodes? : NetworkPath[]
}

interface DashboardFilterProps {
  path: NetworkPath
  setNodeFilter: CallableFunction
  getNodeFilter: CallableFunction
  nodes: NetworkNodePath
}
export const defaultNetworkPath: NetworkPath = [{ type: 'network', name: 'Network' }]

export const defaultDashboardFilter = {
  path: defaultNetworkPath,
  setNodeFilter: () => {}, 
  getNodeFilter: () => ({ path: defaultNetworkPath }),
  nodes: []
} 

export const DashboardFilterContext = React.createContext<DashboardFilterProps>(
  defaultDashboardFilter
)
export type DashboardFilter = DateFilter & { path: NetworkPath } & { filter? : pathFilter }

export function useDashboardFilter () {
  const { getNodeFilter, setNodeFilter } = useContext(DashboardFilterContext)
  const { nodes } = getNodeFilter()
  const { dateFilter } = useContext(DateFilterContext)
  const { range, startDate, endDate } = dateFilter
  return {
    filters: {
      path: defaultNetworkPath,
      ...getDateRangeFilter(range, startDate, endDate),
      filter: { networkNodes: nodes, switchNodes: nodes } 
    },
    setNodeFilter
  }
}

export function DashboardFilterProvider (props: { children: ReactNode }) {
  const [search, setSearch] = useSearchParams()
  const getNodeFilter = () => search.has('dashboardVenueFilter')
    ? JSON.parse(
      Buffer.from(search.get('dashboardVenueFilter') as string, 'base64').toString('ascii')
    )
    : { nodes: [] }

  const setNodeFilter = (Nodes: NetworkPath) => {
    search.set(
      'dashboardVenueFilter',
      Buffer.from(JSON.stringify({ nodes: Nodes.length ? Nodes : [] })).toString('base64')
    )
    setSearch(search, { replace: true })
  }
  const { nodes } = getNodeFilter()

  const providerValue = {
    path: defaultNetworkPath,
    setNodeFilter,
    getNodeFilter,
    nodes
  }
  return (
    <DashboardFilterContext.Provider
      {...props}
      value={providerValue}
    />
  )
}
