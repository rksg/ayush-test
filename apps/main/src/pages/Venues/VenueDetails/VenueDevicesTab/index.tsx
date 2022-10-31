import { useIntl } from 'react-intl'

import { Tabs } from '@acx-ui/components'

import VenueDevicesWidget from '../../../../../../rc/src/components/VenueDevicesWidget';

export function VenueDevicesTab () {
  const { $t } = useIntl()

  return (
    <Tabs
      defaultActiveKey='wifi'
      type='card'
    >
      <Tabs.TabPane tab={$t({ defaultMessage: 'Wi-Fi' })} key='wifi'>
        <div style={{ height: '100%', flex: 1, minHeight: '50vh' }}>
          <VenueDevicesWidget />
        </div>
      </Tabs.TabPane>
      <Tabs.TabPane tab={$t({ defaultMessage: 'Switch' })} key='switch'>
        {$t({ defaultMessage: 'Switch' })}
      </Tabs.TabPane>
    </Tabs>
  )
}
