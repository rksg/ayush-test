import { Tabs }    from 'antd'
import { useIntl } from 'react-intl'

import { VenueMeshApsTable } from './VenueMeshAps'

export function VenueDevicesTab () {
  const { $t } = useIntl()

  return (
    <Tabs
      defaultActiveKey='wifi'
      type='card'
    >
      <Tabs.TabPane tab={$t({ defaultMessage: 'Wi-Fi' })} key='wifi'>
        <VenueMeshApsTable />
      </Tabs.TabPane>
      <Tabs.TabPane tab={$t({ defaultMessage: 'Switch' })} key='switch'>
        {$t({ defaultMessage: 'Switch' })}
      </Tabs.TabPane>
    </Tabs>
  )
}