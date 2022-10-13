import { CheckCircleFilled } from '@ant-design/icons'
import { Tabs }              from 'antd'
import { useIntl }           from 'react-intl'

import { cssStr }      from '@acx-ui/components'
import { ServiceType } from '@acx-ui/rc/utils'

import DHCPInstance from './DHCPInstance'

export function VenueServicesTab () {
  const { $t } = useIntl()


  //FIXME: check service status
  const colorByStatus = cssStr('--acx-semantics-green-50')

  return (
    <Tabs>
      <Tabs.TabPane tab={<span>
        <CheckCircleFilled style={{ color: colorByStatus }}/>
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
