import AnalyticsWidgets from 'analytics/Widgets'
import { Tooltip }      from 'antd'
import { useIntl }      from 'react-intl'

import { useAnalyticsFilter, AnalyticsFilter } from '@acx-ui/analytics/utils'
import { Tabs }                                from '@acx-ui/components'
import { useVenueDetailsHeaderQuery }          from '@acx-ui/rc/services'
import { useLocation, useNavigate, useParams } from '@acx-ui/react-router-dom'
import {  Path }                               from '@acx-ui/react-router-dom'
import { defaultNetworkPath, notAvailableMsg } from '@acx-ui/utils'

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
    path: [{ type: 'zone', name: venueName }],
    urlTabParam: 'activeSubSubTab'
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
    if (params.activeSubTab) {
      const newPath = location.pathname.replace(params.activeSubTab, tab)
      navigate({
        ...location,
        pathname: newPath
      })
    } else {
      navigate({
        ...location,
        pathname: `${location.pathname}/${tab}/overview`
      })
    }
  }
  return (
    <Tabs
      onChange={onTabChange}
      activeKey={params.activeSubTab}
      defaultActiveKey='incidents'
      type='card'>
      <Tabs.TabPane tab={$t({ defaultMessage: 'Incidents' })} key='incidents'>
        <AnalyticsWidgets
          name='incidentsPageWidget'
          filters={{
            ...incidentFilter
          }}
        />
      </Tabs.TabPane>
      <Tabs.TabPane tab={$t({ defaultMessage: 'Health' })} key='health'>
        <AnalyticsWidgets
          name='healthPageWidget'
          filters={{
            ...healthFilter,
            urlBasePath: `venues/${venueId}/venue-details/analytics/health` as unknown as Path
          }}
        />
      </Tabs.TabPane>
      <Tabs.TabPane
        tab={
          <Tooltip title={$t(notAvailableMsg)}>
            {$t({ defaultMessage: 'Configuration' })}
          </Tooltip>
        }
        key='configuration'
        disabled>
        <>{$t({ defaultMessage: 'Configuration Venue Table' })}</>
      </Tabs.TabPane>
      <Tabs.TabPane
        tab={
          <Tooltip title={$t(notAvailableMsg)}>
            {$t({ defaultMessage: 'Reccomendations' })}
          </Tooltip>
        }
        key='reccomendations'
        disabled>
        <>{$t({ defaultMessage: 'Recommendations Venue Table' })}</>
      </Tabs.TabPane>
    </Tabs>
  )
}
