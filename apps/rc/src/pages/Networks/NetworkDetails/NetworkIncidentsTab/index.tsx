import { IncidentTabContent }         from '@acx-ui/analytics/components'
import { AnalyticsFilter, defaultNetworkPath }            from '@acx-ui/analytics/utils'
import { useDateFilter, useEncodedParameter }              from '@acx-ui/utils'

export function NetworkIncidentsTab () {
  const { dateFilter } = useDateFilter()
  const { read } = useEncodedParameter('ssid', true)
  const ssid = read()
  const ssids =  ssid ? [ssid] : []
  const filters = {
    ...dateFilter,
    path: defaultNetworkPath,
    filter: { ssids }
  } as AnalyticsFilter
  return <IncidentTabContent filters={filters} disableGraphs/>
}
