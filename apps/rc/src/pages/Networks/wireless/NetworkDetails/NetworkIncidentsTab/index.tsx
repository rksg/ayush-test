import { IncidentTabContent }   from '@acx-ui/analytics/components'
import { Loader }               from '@acx-ui/components'
import { useDateFilter }        from '@acx-ui/utils'
import type { AnalyticsFilter } from '@acx-ui/utils'

import { extractSSIDFilter, useGetNetwork } from '../services'

export function NetworkIncidentsTab () {
  const { dateFilter } = useDateFilter()
  const network = useGetNetwork()
  const ssids = extractSSIDFilter(network)
  const filters = {
    ...dateFilter,
    filter: { ssids }
  } as AnalyticsFilter

  return <Loader states={[network]}>
    <IncidentTabContent filters={filters} disableGraphs/>
  </Loader>
}
