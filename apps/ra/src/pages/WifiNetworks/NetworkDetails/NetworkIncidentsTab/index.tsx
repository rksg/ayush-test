import { useParams } from 'react-router-dom'

import { IncidentTabContent }   from '@acx-ui/analytics/components'
import { useDateFilter }        from '@acx-ui/utils'
import type { AnalyticsFilter } from '@acx-ui/utils'

export function NetworkIncidentsTab () {
  const { dateFilter } = useDateFilter()
  const { networkId } = useParams()
  const filters = {
    ...dateFilter,
    filter: { ssids: [networkId] }
  } as AnalyticsFilter

  return <IncidentTabContent filters={filters} disableGraphs/>
}
