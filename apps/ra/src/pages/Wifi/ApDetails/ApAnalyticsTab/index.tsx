import { useParams } from 'react-router-dom'

import { AnalyticsTabs }    from '@acx-ui/analytics/components'
import { useApContext }     from '@acx-ui/rc/utils'
import type { NetworkPath } from '@acx-ui/utils'

import { useApFilter } from '../apFilter'

export function ApAnalyticsTab () {
  const { apId } = useParams()
  const apContext = useApContext()
  const filter = useApFilter({ path: apContext.networkPath as unknown as NetworkPath })
  return <AnalyticsTabs
    incidentFilter={filter}
    healthFilter={filter}
    healthPath={`devices/wifi/${apId}/details/ai/health`}
  />
}
