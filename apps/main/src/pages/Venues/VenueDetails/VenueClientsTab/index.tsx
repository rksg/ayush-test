import { useIntl } from 'react-intl'

import { Tabs }                   from '@acx-ui/components'
import { useIsSplitOn, Features } from '@acx-ui/feature-toggle'
import { ClientDualTable }        from '@acx-ui/rc/components'

export function VenueClientsTab () {
  const { $t } = useIntl()

  return (
    <Tabs defaultActiveKey='wifi' type='card'>
      <Tabs.TabPane tab={$t({ defaultMessage: 'Wi-Fi' })} key='wifi'>
        <ClientDualTable />
      </Tabs.TabPane>
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Switch' })}
        key='switch'
        disabled={!useIsSplitOn(Features.DEVICES)}>
        {$t({ defaultMessage: 'Switch' })}
      </Tabs.TabPane>
    </Tabs>
  )
}
