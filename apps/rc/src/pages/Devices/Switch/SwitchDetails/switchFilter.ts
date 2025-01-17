import { pathToFilter }           from '@acx-ui/analytics/utils'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { SwitchViewModel }        from '@acx-ui/rc/utils'
import { useDateFilter }          from '@acx-ui/utils'
import type { AnalyticsFilter }   from '@acx-ui/utils'

export const useSwitchFilter = (details: SwitchViewModel | undefined): AnalyticsFilter => {
  const isDateRangeLimit = useIsSplitOn(Features.ACX_UI_DATE_RANGE_LIMIT)
  const { dateFilter } = useDateFilter({ isDateRangeLimit })
  return {
    ...dateFilter,
    filter: pathToFilter([
      { type: 'switchGroup', name: details?.venueId as string },
      { type: 'switch', name: details?.switchMac?.toUpperCase() as string }
    ])
  }
}
