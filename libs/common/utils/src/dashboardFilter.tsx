import { useMemo } from 'react'

import { Buffer } from 'buffer'

import { useSearchParams } from 'react-router-dom'

import { DateFilter, useDateFilter } from './dateFilter'
import { generateVenueFilter }       from './filters'
import { NetworkPath, pathFilter }   from './types/networkFilter'

export const defaultNetworkPath: NetworkPath = [{ type: 'network', name: 'Network' }]

export type DashboardFilter = DateFilter & { path: NetworkPath } & { filter? : pathFilter }

export function useDashboardFilter () {
  const [search, setSearch] = useSearchParams()
  const { dateFilter } = useDateFilter()
  return useMemo(() => {
    const { nodes } = search.has('dashboardVenueFilter')
      ? JSON.parse(
        Buffer.from(search.get('dashboardVenueFilter') as string, 'base64').toString('ascii')
      )
      : { nodes: [] }
    return {
      filters: {
        path: defaultNetworkPath,
        ...dateFilter,
        filter: nodes.length
          ? generateVenueFilter(nodes.map(([name]:string[]) => name))
          : {}
      },
      setNodeFilter: (nodes: string[][]) => {
        search.set(
          'dashboardVenueFilter',
          Buffer.from(JSON.stringify({ nodes: nodes.length ? nodes : [] })).toString('base64'))
        setSearch(search, { replace: true })
      }
    }
  }, [dateFilter, search, setSearch])
}
