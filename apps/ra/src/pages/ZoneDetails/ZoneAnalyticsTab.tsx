import { AnalyticsTabs }             from '@acx-ui/analytics/components'
import { useParams }                 from '@acx-ui/react-router-dom'
import { AnalyticsFilter, PathNode } from '@acx-ui/utils'

export function ZoneAnalyticsTab () {
  const { systemName, zoneName } = useParams()
  const path = [
    { name: systemName, type: 'system' },
    { name: zoneName, type: 'zone' }
  ] as PathNode[]
  const filters = {
    filter: {
      networkNodes: [path],
      switchNodes: [path]
    },
    path
  } as unknown as AnalyticsFilter
  const healthFilters = {
    filter: {
      networkNodes: [path]
    },
    path
  } as unknown as AnalyticsFilter
  return <AnalyticsTabs
    incidentFilter={filters}
    healthFilter={healthFilters}
    healthPath={`zones/${systemName}/${zoneName}/assurance/health`}
  />
}

