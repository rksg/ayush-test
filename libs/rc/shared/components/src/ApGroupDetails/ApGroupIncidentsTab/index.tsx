import { IncidentTabContent }             from '@acx-ui/analytics/components'
import { getDefaultEarliestStart }        from '@acx-ui/components'
import { useIsSplitOn, Features }         from '@acx-ui/feature-toggle'
import { AnalyticsFilter, useDateFilter } from '@acx-ui/utils'

import { useApGroupContext } from '../ApGroupContextProvider'

export default function ApGroupIncidentsTab () {
  const showResetMsg = useIsSplitOn(Features.ACX_UI_DATE_RANGE_RESET_MSG)
  const { venueId, apGroupId } = useApGroupContext()
  const { dateFilter } = useDateFilter({ showResetMsg,
    earliestStart: getDefaultEarliestStart() })

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