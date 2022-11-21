import { useMemo } from 'react'

import { useSearchParams } from 'react-router-dom'

import { useLocation } from '@acx-ui/react-router-dom'
import {
  generateVenueFilter,
  DateFilter,
  pathFilter,
  NetworkPath,
  NodeType,
  useDateFilter,
  encodeURIComponentAndCovertToBase64,
  decodeBase64String
} from '@acx-ui/utils'

export const defaultNetworkPath: NetworkPath = [{ type: 'network', name: 'Network' }]

export type AnalyticsFilter = DateFilter & { path: NetworkPath } & { filter? : pathFilter }

export function useAnalyticsFilter () {
  const [search, setSearch] = useSearchParams()
  const { pathname } = useLocation()
  const { dateFilter } = useDateFilter()

  return useMemo(() => {
    const isHealthPage = pathname.includes('/analytics/health')
    const getNetworkFilter = () => {
      let networkFilter = search.has('analyticsNetworkFilter')
        ? JSON.parse(
          decodeBase64String(search.get('analyticsNetworkFilter') as string)
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
      search.set(
        'analyticsNetworkFilter',
        encodeURIComponentAndCovertToBase64(JSON.stringify({ path, raw }))
      )
      setSearch(search, { replace: true })
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
  }, [dateFilter, pathname, search, setSearch])
}
