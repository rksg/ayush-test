import { useIntl } from 'react-intl'

import { IncidentTabContent, HealthPage }      from '@acx-ui/analytics/components'
import { useAnalyticsFilter, AnalyticsFilter } from '@acx-ui/analytics/utils'
import { Tabs, Loader }                        from '@acx-ui/components'
import { useApListQuery }                      from '@acx-ui/rc/services'
import { useTableQuery, getFilters }           from '@acx-ui/rc/utils'
import { useLocation, useNavigate, useParams } from '@acx-ui/react-router-dom'

function AnalyticsTabs (props: {
  healthFilter: AnalyticsFilter,
  incidentFilter: AnalyticsFilter,
  healthPath: string
}) {
  const { healthFilter, incidentFilter, healthPath } = props
  const { $t } = useIntl()
  const location = useLocation()
  const navigate = useNavigate()
  const { activeSubTab } = useParams()
  const { filters } = useAnalyticsFilter()
  const onTabChange = (tab: string) => {
    navigate({
      ...location,
      pathname: activeSubTab
        ? location.pathname.replace(activeSubTab as string, tab)
        : `${location.pathname}/${tab}/overview`
    })
  }
  return <Tabs
    onChange={onTabChange}
    activeKey={activeSubTab}
    defaultActiveKey='incidents'
    type='card'
  >
    <Tabs.TabPane tab={$t({ defaultMessage: 'Incidents' })} key='incidents'>
      <IncidentTabContent filters={{ ...filters, ...incidentFilter }} />
    </Tabs.TabPane>
    <Tabs.TabPane tab={$t({ defaultMessage: 'Health' })} key='health'>
      <HealthPage filters={{ ...filters, ...healthFilter }} path={healthPath} />
    </Tabs.TabPane>
  </Tabs>
}

export function ApAnalyticsTab () {
  const params = useParams()
  const { serialNumber } = params
  const tableQuery = useTableQuery({
    useQuery: useApListQuery,
    defaultPayload: {
      searchString: serialNumber,
      fields: ['apMac', 'venueName'],
      filters: getFilters(params)
    }
  })
  const [{ venueName, apMac }] = tableQuery.data?.data ?? [{}]
  const filter = {
    path: [{ type: 'zone', name: venueName }, { type: 'AP', name: apMac }]
  } as AnalyticsFilter
  return <Loader states={[tableQuery]}>
    <AnalyticsTabs
      incidentFilter={filter}
      healthFilter={filter}
      healthPath={`devices/aps/${serialNumber}/details/analytics/health`}
    />
  </Loader>
}
