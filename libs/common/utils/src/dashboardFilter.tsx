import { useMemo } from 'react'

import { useDateFilter }       from './dateFilter'
import { useEncodedParameter } from './encodedParameter'
import { generateVenueFilter } from './filters'

import type { DateFilter }  from './dateFilter'
import type { NodesFilter } from './types/networkFilter'

export type DashboardFilter = DateFilter & { venueIds: string[], filter : NodesFilter }

export function useDashboardFilter () {
  const { read, write } = useEncodedParameter<{ nodes:string[][] }>('dashboardVenueFilter')
  const { dateFilter } = useDateFilter()
  return useMemo(() => {
    const { nodes } = read() || { nodes: [] }
    const venueIds = nodes.map(([name]:string[]) => name)
    return {
      venueIds,
      filters: {
        ...dateFilter,
        filter: nodes.length
          ? generateVenueFilter(venueIds)
          : {}
      },
      setNodeFilter: (nodes: string[][]) => {
        write({ nodes: nodes.length ? nodes : [] })
      }
    }
  }, [dateFilter, read, write])
}
