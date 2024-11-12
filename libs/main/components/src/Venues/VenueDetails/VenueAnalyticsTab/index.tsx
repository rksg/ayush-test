import { AnalyticsTabs }        from '@acx-ui/analytics/components'
import { useParams }            from '@acx-ui/react-router-dom'
import { generateVenueFilter }  from '@acx-ui/utils'
import type { AnalyticsFilter } from '@acx-ui/utils'

export function VenueAnalyticsTab () {
  const { venueId } = useParams()
  const filters = { filter: generateVenueFilter([venueId as string]) } as AnalyticsFilter
  return <AnalyticsTabs
    incidentFilter={filters}
    healthFilter={filters}
    healthPath={`venues/${venueId}/venue-details/analytics/health`}
  />
}
