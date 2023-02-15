import { useMemo } from 'react'

import { useLocation }  from '@acx-ui/react-router-dom'
import {
  generateVenueFilter,
  DateFilter,
  pathFilter,
  ssidFilter,
  NetworkPath,
  NodeType,
  useDateFilter,
  useEncodedParameter
} from '@acx-ui/utils'

export const defaultNetworkPath: NetworkPath = [{ type: 'network', name: 'Network' }]

export type AnalyticsFilter = DateFilter & { path: NetworkPath }
& { filter? : pathFilter & ssidFilter } & { mac?: string }

type NetworkFilter = { path: NetworkPath, raw: object }

export function useAnalyticsFilter () {
  const { read, write } = useEncodedParameter<NetworkFilter>('analyticsNetworkFilter')
  const { pathname } = useLocation()
  const { dateFilter } = useDateFilter()

  return useMemo(() => {
    const isHealthPage = pathname.includes('/analytics/health')
    const getNetworkFilter = () => {
      let networkFilter = read() || { path: defaultNetworkPath, raw: [] }
      const { path: currentPath, raw: rawVal } = networkFilter
      let path, filter, raw
      if (isHealthPage) {
        if (currentPath.some(({ type }: { type: NodeType }) => type === 'switchGroup')) {
          path = defaultNetworkPath
          raw = []
        } else {
          path = currentPath
          raw = rawVal
        }
      } else { // incident page, ...
        if (currentPath.length === 2) { // venues
          filter = generateVenueFilter([currentPath[1].name])
          path = defaultNetworkPath
        } else {
          path = currentPath
        }
        raw = rawVal
      }
      return { networkFilter: { filter, path }, raw }
    }

    const setNetworkPath = (path: NetworkPath, raw: object) => {
      write({ path, raw })
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
