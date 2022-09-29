import React, { ReactNode, useContext } from 'react'

import { Buffer } from 'buffer'

import { useSearchParams } from 'react-router-dom'

import { DateFilterContext, DateFilter } from './dateFilterContext'
import {  getDateRangeFilter }           from './dateUtil'
import { NetworkPath, pathFilter }       from './types/networkFilter'
interface DashboardFilterProps {
  path: NetworkPath
  setNodeFilter: CallableFunction
  getNodeFilter: CallableFunction
}
export const defaultNetworkPath: NetworkPath = [{ type: 'network', name: 'Network' }]

export const defaultDashboardFilter = {
  path: defaultNetworkPath,
  setNodeFilter: () => {},
  getNodeFilter: () => ({ path: defaultNetworkPath, nodes: [] })
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
      filter: nodes.length ? {
        networkNodes: nodes.map(([name]: string[]) => [{ type: 'zone', name }]),
        switchNodes: nodes.map(([name]: string[]) => [{ type: 'switchGroup', name }])
      }: {}
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

  const setNodeFilter = (nodes: string[]) => {
    search.set(
      'dashboardVenueFilter',
      Buffer.from(JSON.stringify({ nodes: nodes.length ? nodes : [] })).toString('base64')
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
