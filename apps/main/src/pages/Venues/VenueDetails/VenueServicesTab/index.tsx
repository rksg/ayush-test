import { useIntl } from 'react-intl'

import { Tabs }        from '@acx-ui/components'
import { ServiceType } from '@acx-ui/rc/utils'

import MdnsProxyInstances from './MdnsProxyInstances'

export function VenueServicesTab () {
  const { $t } = useIntl()
  return (
    <Tabs activeKey={ServiceType.MDNS_PROXY}>
      <Tabs.TabPane tab={$t({ defaultMessage: 'mDNS Proxy' })} key={ServiceType.MDNS_PROXY}>
        <MdnsProxyInstances />
      </Tabs.TabPane>
    </Tabs>
  )
}
