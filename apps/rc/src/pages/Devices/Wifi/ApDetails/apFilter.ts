import { pathToFilter }            from '@acx-ui/analytics/utils'
import { getDefaultEarliestStart } from '@acx-ui/components'
import { Features, useIsSplitOn }  from '@acx-ui/feature-toggle'
import { useDateFilter }           from '@acx-ui/utils'
import type { AnalyticsFilter }    from '@acx-ui/utils'

export const useApFilter = (
  { venueId, apMac }: { venueId?: string, apMac?: string }
): AnalyticsFilter => {
  const showResetMsg = useIsSplitOn(Features.ACX_UI_DATE_RANGE_RESET_MSG)
  const { dateFilter } = useDateFilter({ showResetMsg, earliestStart: getDefaultEarliestStart() })
  return {
    ...dateFilter,
    filter: pathToFilter([
      { type: 'zone', name: venueId as string },
      { type: 'AP', name: apMac as string }
    ])
  }
}
