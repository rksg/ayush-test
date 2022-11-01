import { CheckCircleFilled } from '@ant-design/icons'
import { useIntl }           from 'react-intl'
import { useParams }         from 'react-router-dom'

import { Tabs }                     from '@acx-ui/components'
import { cssStr }                   from '@acx-ui/components'
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
    <Tabs>
      <Tabs.TabPane tab={<span>
        { venueDHCPProfile?.enabled &&
        <CheckCircleFilled style={{ color: cssStr('--acx-semantics-green-50'), marginRight: 5 }}/>}
        {$t({ defaultMessage: 'DHCP' })}</span>}

      key={ServiceType.DHCP}>
        <DHCPInstance/>
      </Tabs.TabPane>
      <Tabs.TabPane tab={$t({ defaultMessage: 'mDNS Proxy' })}
        key={ServiceType.MDNS_PROXY}>
        <p>Content of Tab Pane 1</p>
      </Tabs.TabPane>
    </Tabs>
  )
}
