import { AnalyticsTabs }      from '@acx-ui/analytics/components'
import { useAnalyticsFilter } from '@acx-ui/analytics/utils'
import { useParams }          from '@acx-ui/react-router-dom'

export function ZoneAnalyticsTab () {
  const { systemName, zoneName } = useParams()
  const { filters } = useAnalyticsFilter()
  const healthFilter = {
    ...filters,
    filters: {
      networkNodes: filters.filter.networkNodes
    }
  }
  return <AnalyticsTabs
    incidentFilter={filters}
    healthFilter={healthFilter}
    healthPath={`zones/${systemName}/${zoneName}/analytics/health`}
  />
}

