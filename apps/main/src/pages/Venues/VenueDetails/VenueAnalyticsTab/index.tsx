import { useIntl } from 'react-intl'

import { IncidentTabContent, HealthPage }      from '@acx-ui/analytics/components'
import { useAnalyticsFilter, AnalyticsFilter } from '@acx-ui/analytics/utils'
import { Tabs }                                from '@acx-ui/components'
import { useLocation, useNavigate, useParams } from '@acx-ui/react-router-dom'
import { defaultNetworkPath }                  from '@acx-ui/utils'

export function VenueAnalyticsTab () {
  const { $t } = useIntl()
  const location = useLocation()
  const navigate = useNavigate()
  const params = useParams()
  const { activeSubTab, venueId } = params
  const { filters } = useAnalyticsFilter()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const healthFilter = {
    ...filters,
    path: [{ type: 'zone', name: venueId }]
  } as AnalyticsFilter
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const incidentFilter = {
    ...filters,
    filter: {
      networkNodes: [[{ type: 'zone', name: venueId }]],
      switchNodes: [[{ type: 'switchGroup', name: venueId }]]
    },
    path: defaultNetworkPath
  } as AnalyticsFilter
  const onTabChange = (tab: string) => {
    navigate({
      ...location,
      pathname: location.pathname.replace(activeSubTab as string, tab)
    })
  }
  return <Tabs
    onChange={onTabChange}
    activeKey={activeSubTab}
    defaultActiveKey='incidents'
    type='card'
  >
    <Tabs.TabPane tab={$t({ defaultMessage: 'Incidents' })} key='incidents'>
      <IncidentTabContent filters={incidentFilter} />
    </Tabs.TabPane>
    <Tabs.TabPane tab={$t({ defaultMessage: 'Health' })} key='health'>
      <HealthPage
        filters={healthFilter}
        path={`venues/${venueId}/venue-details/analytics/health`}
      />
    </Tabs.TabPane>
  </Tabs>
}
