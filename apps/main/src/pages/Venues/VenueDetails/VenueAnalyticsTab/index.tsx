
import { Tooltip } from 'antd'
import { useIntl } from 'react-intl'

import { Tabs }            from '@acx-ui/components'
import { notAvailableMsg } from '@acx-ui/utils'

export function VenueAnalyticsTab () {
  const { $t } = useIntl()

  return (
    <Tabs
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
