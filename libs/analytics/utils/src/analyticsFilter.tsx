import { useMemo } from 'react'

import { useLocation } from '@acx-ui/react-router-dom'
import {
  generateVenueFilter,
  useDateFilter,
  useEncodedParameter,
  generatePathFilter,
  getPathFromFilter
} from '@acx-ui/utils'
import type {
  DateFilter,
  PathFilter,
  SSIDFilter,
  NetworkPath,
  NodeType
} from '@acx-ui/utils'

export const defaultNetworkPath: NetworkPath = [{ type: 'network', name: 'Network' }]

export type AnalyticsFilter = DateFilter & { filter : PathFilter & SSIDFilter } & { mac?: string }

type NetworkFilter = { filter: PathFilter, raw: object }

export function useAnalyticsFilter () {
  const { read, write } = useEncodedParameter<NetworkFilter>('analyticsNetworkFilter')
  const { pathname } = useLocation()
  const { dateFilter } = useDateFilter()

  // use dashboard filter as analytics filter when only 1 venue selected
  const dashboardFilter = useEncodedParameter<{ nodes:string[][] }>('dashboardVenueFilter')
  const venuesFilter = dashboardFilter.read()
  if (!read() && venuesFilter?.nodes.length === 1) {
    const [ name ] = venuesFilter.nodes[0]
    const path = [...defaultNetworkPath, { type: 'zone' as NodeType, name }]
    const filter = generatePathFilter(path)
    write({ filter, raw: [JSON.stringify(path)] })
  }

  return useMemo(() => {
    const isHealthPage = pathname.includes('/analytics/health')
    const getNetworkFilter = () => {
      const existingFilter = read()
      let networkFilter = existingFilter?.filter
        ? existingFilter
        : { filter: generatePathFilter(defaultNetworkPath), raw: [] }
      const { filter: currentFilter, raw: rawVal } = networkFilter
      let filter, raw
      if (isHealthPage) {
        const path = getPathFromFilter(currentFilter)
        if (path.some(({ type }: { type: NodeType }) => type === 'switchGroup')) {
          filter = generatePathFilter(defaultNetworkPath)
          raw = []
        } else {
          filter = currentFilter
          raw = rawVal
        }
      } else { // incident page, ...
        const path = getPathFromFilter(currentFilter)
        if (path.length === 2) { // venues
          filter = generateVenueFilter([path[1].name])
        } else {
          filter = currentFilter
        }
        raw = rawVal
      }
      return { networkFilter: { filter }, raw }
    }

    const setNetworkPath = (filter: AnalyticsFilter['filter'], raw: object) => {
      write({ raw, filter })
    }

    const { networkFilter, raw } = getNetworkFilter()
    return {
      filters: {
        ...dateFilter,
        ...networkFilter
      } as AnalyticsFilter,
      setNetworkPath,
      getNetworkFilter,
      raw
    }
  }, [dateFilter, pathname, read, write])
}

export const getFilterPayload = (
  { filter }: { filter: PathFilter }
): { path: NetworkPath, filter: PathFilter } => {
  return {
    path: [{ type: 'network', name: 'Network' }],
    filter
  }
}

