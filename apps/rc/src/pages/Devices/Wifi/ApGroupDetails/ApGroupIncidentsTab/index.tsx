import { IncidentTabContent }             from '@acx-ui/analytics/components'
import { AnalyticsFilter, useDateFilter } from '@acx-ui/utils'

import { useApGroupContext } from '../ApGroupContextProvider'

export default function ApGroupIncidentsTab () {
  const { venueId, apGroupId } = useApGroupContext()
  const { dateFilter } = useDateFilter()

  const filters = {
    ...dateFilter,
    filter: {
      networkNodes: [[
        { type: 'zone', name: venueId },
        { type: 'apGroup', name: apGroupId }
      ]]
    }
  } as AnalyticsFilter

  return <IncidentTabContent filters={filters} />
}