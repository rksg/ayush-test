import { useMemo } from 'react'

import { useDateFilter }       from './dateFilter'
import { useEncodedParameter } from './encodedParameter'
import { generateVenueFilter } from './filters'

import type { DateFilter }              from './dateFilter'
import type { NetworkPath, PathFilter } from './types/networkFilter'

export const defaultNetworkPath: NetworkPath = [{ type: 'network', name: 'Network' }]

export type DashboardFilter = DateFilter & { filter : PathFilter }

export function useDashboardFilter () {
  const { read, write } = useEncodedParameter<{ nodes:string[][] }>('dashboardVenueFilter')
  const { dateFilter } = useDateFilter()
  return useMemo(() => {
    const { nodes } = read() || { nodes: [] }
    return {
      filters: {
        ...dateFilter,
        filter: nodes.length
          ? generateVenueFilter(nodes.map(([name]:string[]) => name))
          : {}
      },
      setNodeFilter: (nodes: string[][]) => {
        write({ nodes: nodes.length ? nodes : [] })
      }
    }
  }, [dateFilter, read, write])
}
