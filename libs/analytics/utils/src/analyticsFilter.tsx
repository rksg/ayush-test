import { useMemo } from 'react'

import { useLocation } from '@acx-ui/react-router-dom'
import {
  DateFilter,
  PathFilter,
  SSIDFilter,
  NetworkPath,
  useDateFilter,
  useEncodedParameter,
  NodeType
} from '@acx-ui/utils'

export const defaultNetworkPath: NetworkPath = [{ type: 'network', name: 'Network' }]

export type AnalyticsFilter = DateFilter & { filter : PathFilter & SSIDFilter } & { mac?: string }

type NetworkFilter = { path: NetworkPath, raw: object }

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
    write({ path, raw: [JSON.stringify(path)] })
  }

  return useMemo(() => {
    const isHealthPage = pathname.includes('/analytics/health')
    const getNetworkFilter = () => {
      let networkFilter = read() || { path: defaultNetworkPath, raw: [] }
      const { path, raw } = networkFilter
      return isHealthPage && path.some(({ type }: { type: NodeType }) => type === 'switchGroup')
        ? { networkFilter: { filter: {} }, raw: [] }
        : { networkFilter: { filter: pathToFilter(path) }, raw }
    }

    const setNetworkPath = (path: NetworkPath, raw: object) => {
      write({ raw, path })
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

export const pathToFilter = (path: NetworkPath): PathFilter => ({
  networkNodes: [path],
  switchNodes: [path]
})
