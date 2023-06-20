import { AnalyticsTabs }                 from '@acx-ui/analytics/components'
import { AnalyticsFilter, pathToFilter } from '@acx-ui/analytics/utils'
import { useParams }                     from '@acx-ui/react-router-dom'
import { generateVenueFilter }           from '@acx-ui/utils'

export function VenueAnalyticsTab () {
  const { venueId } = useParams()
  const healthFilter = {
    filter: pathToFilter([{ type: 'zone', name: venueId! }])
  } as AnalyticsFilter
  const incidentFilter = {
    filter: generateVenueFilter([venueId as string])
  } as AnalyticsFilter
  return <AnalyticsTabs
    incidentFilter={incidentFilter}
    healthFilter={healthFilter}
    healthPath={`venues/${venueId}/venue-details/analytics/health`}
  />
}
