import { useIntl } from 'react-intl'

import { IncidentTabContent, HealthPage }      from '@acx-ui/analytics/components'
import { useAnalyticsFilter, AnalyticsFilter } from '@acx-ui/analytics/utils'
import { Tabs }                                from '@acx-ui/components'
import { useVenueDetailsHeaderQuery }          from '@acx-ui/rc/services'
import { useLocation, useNavigate, useParams } from '@acx-ui/react-router-dom'
import { defaultNetworkPath }                  from '@acx-ui/utils'

export function VenueAnalyticsTab () {
  const { $t } = useIntl()
  const location = useLocation()
  const navigate = useNavigate()
  const params = useParams()
  const { data } = useVenueDetailsHeaderQuery({ params })
  const { filters } = useAnalyticsFilter()
  const venueName = data?.venue.name
  const venueId = data?.venue.id
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const healthFilter = {
    ...filters,
    path: [{ type: 'zone', name: venueName }]
  } as AnalyticsFilter
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const incidentFilter = {
    ...filters,
    filter: {
      networkNodes: [[{ type: 'zone', name: venueName }]],
      switchNodes: [[{ type: 'switchGroup', name: venueName }]]
    },
    path: defaultNetworkPath
  } as AnalyticsFilter
  const onTabChange = (tab: string) => {
    navigate({
      ...location,
      pathname: location.pathname.replace(params.activeSubTab as string, tab)
    })
  }
  return <Tabs
    onChange={onTabChange}
    activeKey={params.activeSubTab}
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
