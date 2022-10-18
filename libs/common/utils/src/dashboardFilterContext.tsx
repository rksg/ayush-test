import { useMemo } from 'react'

import { Buffer } from 'buffer'

import { useSearchParams } from 'react-router-dom'

import { DateFilter, useDateFilter } from './dateFilterContext'
import {  getDateRangeFilter }       from './dateUtil'
import { NetworkPath, pathFilter }   from './types/networkFilter'

export const defaultNetworkPath: NetworkPath = [{ type: 'network', name: 'Network' }]

export type DashboardFilter = DateFilter & { path: NetworkPath } & { filter? : pathFilter }

function getDashboardNodes (
  search: URLSearchParams,
  setSearch: CallableFunction
) {
  const getNodeFilter: () => { nodes: NetworkPath[] | NetworkPath } =
   () => {
     if (search.has('dashboardVenueFilter')) {
       return JSON.parse(
         Buffer.from(search.get('dashboardVenueFilter') as string, 'base64').toString('ascii')
       )
     }
     return { nodes: [] }
   }

  const setNodeFilter = (nodes: NetworkPath[] | NetworkPath) => {
    search.set(
      'dashboardVenueFilter',
      Buffer.from(JSON.stringify({ nodes: nodes.length ? nodes : [] })).toString('base64'))
    setSearch(search, { replace: true })
  }
  const { nodes } = getNodeFilter()

  return {
    path: defaultNetworkPath,
    setNodeFilter,
    getNodeFilter,
    nodes
  }
}

export function useDashboardFilter () {
  const [search, setSearch] = useSearchParams()
  const { dateFilter } = useDateFilter()

  return useMemo(() => {
    const { getNodeFilter, setNodeFilter } = getDashboardNodes(search, setSearch)
    const { nodes } = getNodeFilter()
    const { range, startDate, endDate } = dateFilter
    const networkNodes: NetworkPath[] = nodes.map(node => {
      if (Array.isArray(node)) {
        const [name] = node
        return [{ name, type: 'zone' }] as unknown as NetworkPath
      }

      return [{ name: node.name, type: 'zone' }]
    })
    const switchNodes: NetworkPath[] = nodes.map(node => {
      if (Array.isArray(node)) {
        const [name] = node
        return [{ name, type: 'switchGroup' }] as unknown as NetworkPath
      }

      return [{ name: node.name, type: 'switchGroup' }]
    })
    return {
      filters: {
        path: defaultNetworkPath,
        ...getDateRangeFilter(range, startDate, endDate),
        filter: nodes.length ? {
          networkNodes,
          switchNodes
        }: {}
      },
      setNodeFilter
    }
  }, [dateFilter, search, setSearch])
}
