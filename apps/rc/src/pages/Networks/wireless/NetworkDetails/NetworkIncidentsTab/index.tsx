import { IncidentTabContent } from '@acx-ui/analytics/components'
import { AnalyticsFilter }    from '@acx-ui/analytics/utils'
import { Loader }             from '@acx-ui/components'
import { useDateFilter }      from '@acx-ui/utils'

import { extractSSIDFilter, useGetNetwork } from '../services'

export function NetworkIncidentsTab () {
  const { dateFilter } = useDateFilter()
  const network = useGetNetwork()
  const ssids = extractSSIDFilter(network)
  const filters = {
    ...dateFilter,
    filter: { ssids }
  } as AnalyticsFilter
  const systemCreatedNetwork = network?.data?.isOweMaster === false

  return <Loader states={[network]}>
    <IncidentTabContent filters={filters} systemNetwork={systemCreatedNetwork} disableGraphs/>
  </Loader>
}
