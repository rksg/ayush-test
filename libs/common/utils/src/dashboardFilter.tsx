import { useMemo } from 'react'

import { Buffer } from 'buffer'

import { useSearchParams } from 'react-router-dom'

import { DateFilter, useDateFilter } from './dateFilter'
import {  getDateRangeFilter }       from './dateUtil'
import { NetworkPath, pathFilter }   from './types/networkFilter'

export const defaultNetworkPath: NetworkPath = [{ type: 'network', name: 'Network' }]

export type DashboardFilter = DateFilter & { path: NetworkPath } & { filter? : pathFilter }

const formatNodes = (type: string, nodes: string[][]) =>
  nodes.map(([name]: string[]) => [{ type, name }] as NetworkPath)

export function useDashboardFilter () {
  const [search, setSearch] = useSearchParams()
  const { dateFilter } = useDateFilter()
  return useMemo(() => {
    const { nodes } = search.has('dashboardVenueFilter')
      ? JSON.parse(
        Buffer.from(search.get('dashboardVenueFilter') as string, 'base64').toString('ascii')
      )
      : { nodes: [] }
    const { range, startDate, endDate } = dateFilter
    return {
      filters: {
        path: defaultNetworkPath,
        ...getDateRangeFilter(range, startDate, endDate),
        filter: nodes.length ? {
          networkNodes: formatNodes('zone', nodes),
          switchNodes: formatNodes('switchGroup', nodes)
        }: {}
      },
      setNodeFilter: (nodes: NetworkPath[]) => {
        search.set(
          'dashboardVenueFilter',
          Buffer.from(JSON.stringify({ nodes: nodes.length ? nodes : [] })).toString('base64'))
        setSearch(search, { replace: true })
      }
    }
  }, [dateFilter, search, setSearch])
}
