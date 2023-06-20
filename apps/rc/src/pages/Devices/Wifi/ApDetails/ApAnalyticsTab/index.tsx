import { AnalyticsTabs }                                     from '@acx-ui/analytics/components'
import { AnalyticsFilter, useAnalyticsFilter, pathToFilter } from '@acx-ui/analytics/utils'
import { useApContext }                                      from '@acx-ui/rc/utils'
import { NodeType }                                          from '@acx-ui/utils'

export function ApAnalyticsTab () {
  const { serialNumber, apMac, venueId } = useApContext()
  const { filters } = useAnalyticsFilter()
  const filter = {
    ...filters,
    filter: pathToFilter([
      { type: 'zone' as NodeType, name: venueId as string },
      { type: 'AP' as NodeType, name: apMac as string }
    ])
  } as AnalyticsFilter
  return <AnalyticsTabs
    incidentFilter={filter}
    healthFilter={filter}
    healthPath={`devices/wifi/${serialNumber}/details/analytics/health`}
  />
}
