import { useMemo } from 'react'

import { DateFilter, useDateFilter } from './dateFilter'
import { useEncodedParameter }       from './encodedParameter'
import { generateVenueFilter }       from './filters'
import { NetworkPath, pathFilter }   from './types/networkFilter'

export const defaultNetworkPath: NetworkPath = [{ type: 'network', name: 'Network' }]

export type DashboardFilter = DateFilter & { path: NetworkPath } & { filter? : pathFilter }

export function useDashboardFilter () {
  const { read, write } = useEncodedParameter<{ nodes:string[][] }>('dashboardVenueFilter')
  const { dateFilter } = useDateFilter()
  return useMemo(() => {
    const { nodes } = read() || { nodes: [] }
    return {
      filters: {
        path: defaultNetworkPath,
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
