import { AnalyticsTabs } from '@acx-ui/analytics/components'
import { useApContext }  from '@acx-ui/rc/utils'

import { useApFilter } from '../apFilter'

export function ApAnalyticsTab () {
  const apContext = useApContext()
  const filter = useApFilter(apContext)
  return <AnalyticsTabs
    incidentFilter={filter}
    healthFilter={filter}
    healthPath={`devices/wifi/${apContext.serialNumber}/details/analytics/health`}
  />
}
