import { AnalyticsTabs }   from '@acx-ui/analytics/components'
import { AnalyticsFilter } from '@acx-ui/analytics/utils'
import { Loader }          from '@acx-ui/components'
import { useApListQuery }  from '@acx-ui/rc/services'
import { useParams }       from '@acx-ui/react-router-dom'

export function ApAnalyticsTab () {
  const params = useParams()
  const { serialNumber } = params
  const tableQuery = useApListQuery({
    params,
    payload: {
      searchString: serialNumber,
      fields: ['apMac', 'venueName']
    }
  })
  const [{ venueName, apMac }] = tableQuery.data?.data ?? [{}]
  const filter = {
    path: [{ type: 'zone', name: venueName }, { type: 'AP', name: apMac }]
  } as AnalyticsFilter
  return <Loader states={[{ ...tableQuery, isFetching: false }]}>
    <AnalyticsTabs
      incidentFilter={filter}
      healthFilter={filter}
      healthPath={`devices/aps/${serialNumber}/details/analytics/health`}
    />
  </Loader>
}
