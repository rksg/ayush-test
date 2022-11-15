import { Badge }     from 'antd'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Tabs, cssStr }             from '@acx-ui/components'
import { useVenueDHCPProfileQuery } from '@acx-ui/rc/services'
import { ServiceType }              from '@acx-ui/rc/utils'

import DHCPInstance from './DHCPInstance'


export function VenueServicesTab () {
  const { $t } = useIntl()
  const params = useParams()
  const { data: venueDHCPProfile } = useVenueDHCPProfileQuery({
    params
  })

  return (
    <Tabs type='card' defaultActiveKey={ServiceType.DHCP}>
      <Tabs.TabPane key={ServiceType.DHCP}
        tab={$t({ defaultMessage: 'DHCP' })}>
        <Tabs>
          <Tabs.TabPane tab={<div style={{ display: 'flex', alignItems: 'end' }}>
            <Badge dot={venueDHCPProfile?.enabled}
              offset={[-3, 0]}
              style={{ backgroundColor: cssStr('--acx-semantics-green-50') }}/>
            <span style={{ paddingLeft: 10 }}>{$t({ defaultMessage: 'Wi-Fi' })}</span>
          </div>
          }
          key={'wifi'}>
            <DHCPInstance/>
          </Tabs.TabPane>

        </Tabs>
      </Tabs.TabPane>
      <Tabs.TabPane tab={$t({ defaultMessage: 'mDNS Proxy' })}
        key={ServiceType.MDNS_PROXY}>
        <p>Content of Tab Pane 1</p>
      </Tabs.TabPane>
    </Tabs>
  )
}
