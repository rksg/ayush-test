import { AnalyticsTabs }   from '@acx-ui/analytics/components'
import { AnalyticsFilter } from '@acx-ui/analytics/utils'

import { useApContext } from '../ApContext'

export function ApAnalyticsTab () {
  const { serialNumber, apMac } = useApContext()
  const filter = {
    path: [{ type: 'AP', name: apMac }]
  } as AnalyticsFilter
  return <AnalyticsTabs
    incidentFilter={filter}
    healthFilter={filter}
    healthPath={`devices/wifi/${serialNumber}/details/analytics/health`}
  />
}
