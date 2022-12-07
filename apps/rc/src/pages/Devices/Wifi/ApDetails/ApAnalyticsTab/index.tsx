import { AnalyticsTabs }   from '@acx-ui/analytics/components'
import { AnalyticsFilter } from '@acx-ui/analytics/utils'
import { Loader }          from '@acx-ui/components'
import { useApListQuery }  from '@acx-ui/rc/services'
import { useParams }       from '@acx-ui/react-router-dom'

export function ApAnalyticsTab () {
  const { serialNumber, tenantId } = useParams()
  const results = useApListQuery({
    params: { tenantId },
    payload: {
      searchString: serialNumber,
      fields: ['apMac', 'venueName']
    }
  }, {
    selectFromResult: ({ data, ...rest }) => ({
      data: data?.data,
      ...rest
    })
  })
  const [{ venueName, apMac }] = results.data ?? [{}]
  const filter = {
    path: [{ type: 'zone', name: venueName }, { type: 'AP', name: apMac }]
  } as AnalyticsFilter
  return <Loader states={[results]}>
    <AnalyticsTabs
      incidentFilter={filter}
      healthFilter={filter}
      healthPath={`devices/wifi/${serialNumber}/details/analytics/health`}
    />
  </Loader>
}
