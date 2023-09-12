import { pathToFilter }         from '@acx-ui/analytics/utils'
import { SwitchViewModel }      from '@acx-ui/rc/utils'
import { useDateFilter }        from '@acx-ui/utils'
import type { AnalyticsFilter } from '@acx-ui/utils'

export const useSwitchFilter = (details: SwitchViewModel | undefined): AnalyticsFilter => {
  const { dateFilter } = useDateFilter()
  return {
    ...dateFilter,
    filter: pathToFilter([
      { type: 'switchGroup', name: details?.venueId as string },
      { type: 'switch', name: details?.switchMac?.toUpperCase() as string }
    ])
  }
}
