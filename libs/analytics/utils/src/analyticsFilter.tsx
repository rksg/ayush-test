import { useMemo } from 'react'

import { get }         from '@acx-ui/config'
import { useLocation } from '@acx-ui/react-router-dom'
import {
  AnalyticsFilter,
  PathFilter,
  NodeType,
  NodeFilter,
  NodesFilter,
  SSIDFilter,
  NetworkPath,
  useDateFilter,
  useEncodedParameter,
  FilterNameNode,
  FilterListNode
} from '@acx-ui/utils'

export const defaultNetworkPath: NetworkPath = [{ type: 'network', name: 'Network' }]
type NetworkFilter = { path: NetworkPath, raw: object }

const noSwitchSupportURLs = [
  '/ai/health/wireless',
  '/analytics/health/wireless',
  '/analytics/configChange',
  '/ai/configChange',
  '/ai/reports/aps',
  '/ai/reports/airtime',
  '/ai/reports/applications',
  '/ai/reports/wireless',
  '/ai/reports/clients',
  '/ai/reports/wlans',
  '/ai/users/wifi/reports',
  '/ai/devices/wifi/reports/aps',
  '/ai/devices/wifi/reports/airtime',
  '/ai/networks/wireless/reports/wlans',
  '/ai/networks/wireless/reports/applications',
  '/ai/networks/wireless/reports/wireless'
]

const noApSupportURLs = [
  '/ai/health/wired',
  '/analytics/health/wired',
  '/ai/reports/switches',
  '/ai/reports/wired',
  '/ai/devices/switch/reports/wired'
]

// URLs here will only load filter till domains which is common across APs and Switches
const noApOrSwitchSupportURLs = [
  '/ai/health/overview',
  '/analytics/health/overview'
]

interface AnalyticsFilterProps {
  revertToDefaultURLs?: {
    url: string
    type: string
  }[]
}

export function useAnalyticsFilter (props?: AnalyticsFilterProps) {
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

  const { revertToDefaultURLs: customURLs } = props || {}
  if (customURLs) {
    for (const { url, type } of customURLs) {
      if (type === 'ap' && !noApSupportURLs.includes(url)) noApSupportURLs.push(url)
      if (type === 'switch' && !noSwitchSupportURLs.includes(url)) noSwitchSupportURLs.push(url)
      // eslint-disable-next-line max-len
      if (type === 'both' && !noApOrSwitchSupportURLs.includes(url)) noApOrSwitchSupportURLs.push(url)
    }
  }

  return useMemo(() => {
    const isURLPresent = (list: string[]) => Boolean(list.find(url => pathname.includes(url)))
    const defaultPath = { raw: [], path: defaultNetworkPath }
    const { raw: rawPath, path: readPath } = read() || defaultPath

    const revertToDefault =
      (isURLPresent(noApOrSwitchSupportURLs) && (isApPath(readPath) || isSwitchPath(readPath))) ||
      (isURLPresent(noSwitchSupportURLs) && isSwitchPath(readPath)) ||
      (isURLPresent(noApSupportURLs) && isApPath(readPath))
    const { raw, path, filter } = revertToDefault
      ? { ...defaultPath, filter: {} }
      : { raw: rawPath, path: readPath, filter: pathToFilter(readPath) }
    return {
      raw,
      filters: { ...dateFilter, filter } as AnalyticsFilter,
      pathFilters: { ...dateFilter, path } as PathFilter,
      setNetworkPath: (path: NetworkPath, raw: object) => write({ raw, path })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFilter, pathname, read, write])
}

export const getFilterPayload = (
  { filter }: { filter: NodesFilter & SSIDFilter }
): { path: NetworkPath, filter: NodesFilter & SSIDFilter } => {
  return {
    path: defaultNetworkPath, // needed mainly for hierarchyNode even when filter used
    filter
  }
}

export const pathToFilter = (networkPath: NetworkPath): NodesFilter => {
  const path = networkPath.filter(({ type }: { type: NodeType }) => type !== 'network')
  if(path.length === 0) {
    return {}
  }
  if(!get('IS_MLISA_SA') && path.length === 1) { // at venue level we want to see both its switches and aps
    const { type, name } = path[0]
    if (['zone', 'switchGroup'].includes(type)) {
      return {
        networkNodes: [[{ type: 'zone', name }]],
        switchNodes: [[{ type: 'switchGroup', name }]]
      }
    }
  }
  const filter: NodeFilter = path.map(({ type, name }) => {
    if (type === 'AP') {
      return { type: 'apMac', list: [name] }
    } else if (type === 'switch') {
      return { type, list: [name] }
    } else {
      return { type: type as FilterNameNode['type'], name }
    }
  })
  return { // at ap/switch level we want to see only data for that device, so we set the other path to filter everything out
    networkNodes: [filter],
    switchNodes: [filter]
  }
}

export const getSelectedNodePath = (filter: NodesFilter): NetworkPath => {
  const { networkNodes, switchNodes } = filter
  return (networkNodes?.[0] || switchNodes?.[0] || []).reduce((path, node) => {
    const { type } = node
    if (type === 'apMac') {
      path.push({ type: 'AP', name: (node as FilterListNode).list[0] })
    } else if (type === 'switch') {
      path.push({ type, name: (node as FilterListNode).list[0] })
    } else {
      path.push({ type, name: (node as FilterNameNode).name })
    }
    return path
  }, defaultNetworkPath.slice())
}

export const isSwitchPath = (path: NetworkPath) => {
  return get('IS_MLISA_SA')
    ? Boolean(path.find(({ type }) => type === 'switchGroup'))
    : Boolean(path.find(({ type }) => type === 'switch'))
}

export const isApPath = (path: NetworkPath) => {
  return get('IS_MLISA_SA')
    ? Boolean(path.find(({ type }) => type === 'zone' || type === 'apGroup'))
    : Boolean(path.find(({ type }) => type === 'AP'))
}