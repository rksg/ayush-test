import { IncidentTabContent }             from '@acx-ui/analytics/components'
import { useIsSplitOn, Features }         from '@acx-ui/feature-toggle'
import { AnalyticsFilter, useDateFilter } from '@acx-ui/utils'

import { useApGroupContext } from '../ApGroupContextProvider'

export default function ApGroupIncidentsTab () {
  const isDateRangeLimit = useIsSplitOn(Features.ACX_UI_DATE_RANGE_LIMIT)
  const { venueId, apGroupId } = useApGroupContext()
  const { dateFilter } = useDateFilter({ isDateRangeLimit })

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