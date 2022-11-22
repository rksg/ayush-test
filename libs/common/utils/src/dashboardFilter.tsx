import { useMemo } from 'react'

import { useSearchParams } from 'react-router-dom'

import { DateFilter, useDateFilter }                               from './dateFilter'
import { encodeURIComponentAndCovertToBase64, decodeBase64String } from './encodeDecodeUtil'
import { generateVenueFilter }                                     from './filters'
import { NetworkPath, pathFilter }                                 from './types/networkFilter'

export const defaultNetworkPath: NetworkPath = [{ type: 'network', name: 'Network' }]

export type DashboardFilter = DateFilter & { path: NetworkPath } & { filter? : pathFilter }

export function useDashboardFilter () {
  const [search, setSearch] = useSearchParams()
  const { dateFilter } = useDateFilter()
  return useMemo(() => {
    const { nodes } = search.has('dashboardVenueFilter')
      ? JSON.parse(
        decodeBase64String(search.get('dashboardVenueFilter') as string)
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
          encodeURIComponentAndCovertToBase64(JSON.stringify({ nodes: nodes.length ? nodes : [] })))
        setSearch(search, { replace: true })
      }
    }
  }, [dateFilter, search, setSearch])
}
