import { IncidentTabContent }     from '@acx-ui/analytics/components'
import { Loader }                 from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { useDateFilter }          from '@acx-ui/utils'
import type { AnalyticsFilter }   from '@acx-ui/utils'

import { extractSSIDFilter, useGetNetwork } from '../services'

export function NetworkIncidentsTab () {
  const isDateRangeLimit = useIsSplitOn(Features.ACX_UI_DATE_RANGE_LIMIT)
  const { dateFilter } = useDateFilter({ isDateRangeLimit })
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
