import { useIntl } from 'react-intl'

import { Tabs }                    from '@acx-ui/components'
import { PolicyType, ServiceType } from '@acx-ui/rc/utils'


import ClientIsolationAllowList from './ClientIsolationAllowList'
import DHCPInstance             from './DHCPInstance'
import MdnsProxyInstances       from './MdnsProxyInstances'
import { VenueRogueAps }        from './VenueRogueAps'

export function VenueServicesTab () {
  const { $t } = useIntl()

  return (
    <Tabs type='card' defaultActiveKey={ServiceType.DHCP}>
      <Tabs.TabPane key={ServiceType.DHCP}
        tab={$t({ defaultMessage: 'DHCP' })}>
        <Tabs type='third'>
          <Tabs.TabPane tab={$t({ defaultMessage: 'Wi-Fi' })}
            key={'wifi'}>
            <DHCPInstance/>
          </Tabs.TabPane>

        </Tabs>
      </Tabs.TabPane>
      <Tabs.TabPane tab={$t({ defaultMessage: 'mDNS Proxy' })} key={ServiceType.MDNS_PROXY}>
        <MdnsProxyInstances />
      </Tabs.TabPane>
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Client Isolation Allowlist' })}
        key={PolicyType.CLIENT_ISOLATION}
      >
        <ClientIsolationAllowList />
      </Tabs.TabPane>
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Rogue Aps' })}
        key={'rogueAps'}
      >
        <VenueRogueAps />
      </Tabs.TabPane>
    </Tabs>
  )
}
