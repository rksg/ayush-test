import { pathToFilter }                      from '@acx-ui/analytics/utils'
import { useDateFilter }                     from '@acx-ui/utils'
import type { AnalyticsFilter, NetworkPath } from '@acx-ui/utils'

export const useApFilter = ({ path }: { path: NetworkPath }
): AnalyticsFilter => {
  const { dateFilter } = useDateFilter()
  return {
    ...dateFilter,
    filter: pathToFilter(path)
  }
}
