import { AnalyticsTabs }      from '@acx-ui/analytics/components'
import { AnalyticsFilter }    from '@acx-ui/analytics/utils'
import { useApContext }       from '@acx-ui/rc/utils'
import { generatePathFilter } from '@acx-ui/utils'

export function ApAnalyticsTab () {
  const { serialNumber, apMac } = useApContext()
  const filter = {
    filter: generatePathFilter([{ type: 'AP', name: apMac! }])
  } as unknown as AnalyticsFilter
  return <AnalyticsTabs
    incidentFilter={filter}
    healthFilter={filter}
    healthPath={`devices/wifi/${serialNumber}/details/analytics/health`}
  />
}
