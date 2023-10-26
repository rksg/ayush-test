import { pathToFilter }                      from '@acx-ui/analytics/utils'
import { useDateFilter }                     from '@acx-ui/utils'
import type { AnalyticsFilter, NetworkPath } from '@acx-ui/utils'

export const useApFilter = (
  { apMac, path }: { apMac?: string, path: NetworkPath }
): AnalyticsFilter => {
  const { dateFilter } = useDateFilter()
  const networkPath = path ? [...path] : [{ type: 'AP', name: apMac as string }] as NetworkPath
  return {
    ...dateFilter,
    filter: pathToFilter(networkPath)
  }
}
