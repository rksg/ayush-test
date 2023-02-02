import { IncidentTabContent }         from '@acx-ui/analytics/components'
import { AnalyticsFilter, defaultNetworkPath }            from '@acx-ui/analytics/utils'
import { useSearchParams  }                 from '@acx-ui/react-router-dom'
import { useDateFilter, useEncodedParameter }              from '@acx-ui/utils'

export function NetworkIncidentsTab () {
  const { dateFilter } = useDateFilter()
  const [searchParams] = useSearchParams()
  const { read } = useEncodedParameter('ssid')
  const ssids = searchParams.get('ssid') ? [read()] : []
  const filters = {
    ...dateFilter,
    path: defaultNetworkPath,
    filter: { ssids }
  } as AnalyticsFilter
  return <IncidentTabContent filters={filters} disableGraphs/>
}
