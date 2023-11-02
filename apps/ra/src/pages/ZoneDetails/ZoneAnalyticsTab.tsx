import { AnalyticsTabs }   from '@acx-ui/analytics/components'
import { useParams }       from '@acx-ui/react-router-dom'
import { AnalyticsFilter } from '@acx-ui/utils'

export function ZoneAnalyticsTab ({ filters, healthFilters }: {
  filters: AnalyticsFilter,
  healthFilters: AnalyticsFilter
}) {
  const { systemName, zoneName } = useParams()
  return <AnalyticsTabs
    incidentFilter={filters}
    healthFilter={healthFilters}
    healthPath={`zones/${systemName}/${zoneName}/assurance/health`}
  />
}

