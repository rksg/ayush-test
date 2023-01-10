import { IncidentTabContent }         from '@acx-ui/analytics/components'
import { AnalyticsFilter }            from '@acx-ui/analytics/utils'
import { useSwitchDetailHeaderQuery } from '@acx-ui/rc/services'
import { useParams  }                 from '@acx-ui/react-router-dom'
import { useDateFilter }              from '@acx-ui/utils'


export function SwitchIncidentsTab () {
  const { dateFilter } = useDateFilter()
  const params = useParams()
  const switchDetailQuery = useSwitchDetailHeaderQuery({ params })
  const filters = {
    ...dateFilter,
    path: [
      { type: 'network', name: 'Network' },
      { type: 'switchGroup', name: switchDetailQuery.data?.venueName },
      { type: 'switch', name: switchDetailQuery.data?.switchMac }
    ]
  } as AnalyticsFilter

  return <IncidentTabContent filters={filters} disableGraphs/>
}