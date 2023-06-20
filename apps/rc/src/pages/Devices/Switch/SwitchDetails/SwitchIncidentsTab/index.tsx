import { IncidentTabContent }            from '@acx-ui/analytics/components'
import { AnalyticsFilter, pathToFilter } from '@acx-ui/analytics/utils'
import { Loader }                        from '@acx-ui/components'
import { useSwitchDetailHeaderQuery }    from '@acx-ui/rc/services'
import { useParams  }                    from '@acx-ui/react-router-dom'
import { useDateFilter }                 from '@acx-ui/utils'

export function SwitchIncidentsTab () {
  const { dateFilter } = useDateFilter()
  const params = useParams()
  const switchDetailQuery = useSwitchDetailHeaderQuery({ params })
  const filters = {
    ...dateFilter,
    filter: pathToFilter([
      { type: 'switch', name: switchDetailQuery.data?.switchMac?.toUpperCase() as string }
    ])
  } as AnalyticsFilter
  return <Loader states={[switchDetailQuery]}>
    <IncidentTabContent filters={filters} disableGraphs/>
  </Loader>
}