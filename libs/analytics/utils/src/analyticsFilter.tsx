import { useMemo } from 'react'

import { Buffer } from 'buffer'

import { useSearchParams } from 'react-router-dom'

import { useLocation, Path }                                                                from '@acx-ui/react-router-dom'
import { getDateRangeFilter, DateFilter, pathFilter, NetworkPath, NodeType, useDateFilter } from '@acx-ui/utils'

export const defaultNetworkPath: NetworkPath = [{ type: 'network', name: 'Network' }]

export type AnalyticsFilter = DateFilter & {
  path: NetworkPath;
  filter?: pathFilter;
  urlBasePath?: Path;
  urlTabparam?: string
}

export function useAnalyticsFilter () {
  const [search, setSearch] = useSearchParams()
  const { pathname } = useLocation()
  const { dateFilter } = useDateFilter()

  return useMemo(() => {
    const isHealthPage = pathname.includes('/analytics/health')
    const getNetworkFilter = () => {
      let networkFilter = search.has('analyticsNetworkFilter')
        ? JSON.parse(
          Buffer.from(search.get('analyticsNetworkFilter') as string, 'base64').toString('ascii')
        )
        : { path: defaultNetworkPath, raw: [] }
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
          filter = {
            networkNodes: [currentPath.slice(1)]
              .map(([node]) => [{ type: 'zone', name: node.name }]),
            switchNodes: [currentPath.slice(1)]
              .map(([node]) => [{ type: 'switchGroup', name: node.name }])
          } as pathFilter
          path = defaultNetworkPath
        } else {
          path = currentPath
        }
        raw = rawVal
      }
      return { networkFilter: { filter, path }, raw }
    }

    const setNetworkPath = (path: NetworkPath, raw: object) => {
      search.set(
        'analyticsNetworkFilter',
        Buffer.from(JSON.stringify({ path, raw })).toString('base64')
      )
      setSearch(search, { replace: true })
    }

    const { networkFilter, raw } = getNetworkFilter()
    const { range, startDate, endDate } = dateFilter

    return {
      filters: {
        ...getDateRangeFilter(range, startDate, endDate),
        ...networkFilter
      } as AnalyticsFilter,
      setNetworkPath,
      getNetworkFilter,
      raw
    }
  }, [dateFilter, pathname, search, setSearch])
}
