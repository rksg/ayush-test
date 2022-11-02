
import { Tooltip } from 'antd'
import { useIntl } from 'react-intl'

import { Tabs }                       from '@acx-ui/components'
import { useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { notAvailableMsg }            from '@acx-ui/utils'

export function VenueAnalyticsTab () {
  const { $t } = useIntl()
  const basePath = useTenantLink('/venue-analytics/')
  const navigate = useNavigate()
  const onTabChange = (tab:string) =>
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })

  return (
    <Tabs
      onChange={onTabChange}
      defaultActiveKey='incidents'
      type='card'
    >
      <Tabs.TabPane tab={$t({ defaultMessage: 'Incidents' })} key='incidents'>
        <>{$t({ defaultMessage: 'Incident Venue Table' })}</>
      </Tabs.TabPane>
      <Tabs.TabPane tab={$t({ defaultMessage: 'Health' })} key='health'>
        <>{$t({ defaultMessage: 'Health Venue Table' })}</>
      </Tabs.TabPane>
      <Tabs.TabPane tab={<Tooltip title={$t(notAvailableMsg)}>
        {$t({ defaultMessage: 'Configuration' })}
      </Tooltip>}
      key='configuration'
      disabled>
        <>{$t({ defaultMessage: 'Configuration Venue Table' })}</>
      </Tabs.TabPane>
      <Tabs.TabPane tab={<Tooltip title={$t(notAvailableMsg)}>
        {$t({ defaultMessage: 'Reccomendations' })}
      </Tooltip>}
      key='reccomendations'
      disabled>
        <>{$t({ defaultMessage: 'Recommendations Venue Table' })}</>
      </Tabs.TabPane>
    </Tabs>
  )
}
