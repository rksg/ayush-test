import { IncidentTabContent }                  from '@acx-ui/analytics/components'
import { AnalyticsFilter, defaultNetworkPath } from '@acx-ui/analytics/utils'
import { useDateFilter }                       from '@acx-ui/utils'

import { extractSSIDFilter, useGetNetwork } from '../services'

export function NetworkIncidentsTab () {
  const { dateFilter } = useDateFilter()
  const ssids = extractSSIDFilter(useGetNetwork())
  const filters = {
    ...dateFilter,
    path: defaultNetworkPath,
    filter: { ssids }
  } as AnalyticsFilter
  return <IncidentTabContent filters={filters} disableGraphs/>
}
