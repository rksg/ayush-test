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
    const path = [{ type: 'zone' as NodeType, name }]
    write({ path, raw: [JSON.stringify(path)] })
  }

  return useMemo(() => {
    const { path, raw: rawPath } = read() || { path: [], raw: [] }
    // const hasNetwork = path.some(({ type }: { type: NodeType }) => type === 'network') // temp for existing urls, should be removed
    const isSwitchPath = path.some(({ type }: { type: NodeType }) => type === 'switchGroup')
    const isHealthPage = pathname.includes('/analytics/health')
    const { filter, raw } = (isHealthPage && isSwitchPath) // || hasNetwork
      ? { filter: {}, raw: [] }
      : { filter: pathToFilter(path), raw: rawPath }
    return {
      raw,
      filters: { ...dateFilter, filter } as AnalyticsFilter,
      setNetworkPath: (path: NetworkPath, raw: object) => write({ raw, path })
    }
  }, [dateFilter, pathname, read, write])
}

export const getFilterPayload = (
  { filter }: { filter: PathFilter }
): { path: NetworkPath, filter: PathFilter } => {
  return {
    path: defaultNetworkPath, // to avoid error from legacy api
    filter
  }
}

export const pathToFilter = (path: NetworkPath): PathFilter => {
  switch (path.length) {
    case 0:
      return {}
    case 1: // at venue level we want to see both its switches and aps
      return {
        networkNodes: [[{ type: 'zone', name: path[0].name }]],
        switchNodes: [[{ type: 'switchGroup', name: path[0].name }]]
      }
    default: // at ap/switch level we want to see only data for that device, so we set the other path to filter everything out
      return {
        networkNodes: [path],
        switchNodes: [path]
      }
  }
}

export const getSelectedNodePath = (filter: PathFilter) => {
  const { networkNodes, switchNodes } = filter
  return (networkNodes?.[0] || switchNodes?.[0] || defaultNetworkPath)
}
