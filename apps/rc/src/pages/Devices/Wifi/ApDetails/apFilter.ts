import { AnalyticsFilter, pathToFilter } from '@acx-ui/analytics/utils'
import { useDateFilter }                 from '@acx-ui/utils'

export const useApFilter = (
  { venueId, apMac }: { venueId?: string, apMac?: string }
): AnalyticsFilter => {
  const { dateFilter } = useDateFilter()
  return {
    ...dateFilter,
    filter: pathToFilter([
      { type: 'zone', name: venueId as string },
      { type: 'AP', name: apMac as string }
    ])
  }
}
