import { useState } from 'react'

import { useIntl } from 'react-intl'

import { Tabs }                       from '@acx-ui/components'
import { getUserProfile, isCoreTier } from '@acx-ui/user'

import { useWifiAclTotalCount } from '../counterUtils'

import AccessControlSet              from './AccessControlSet'
import ApplicationPolicyComponentSet from './ApplicationPolicyComponentSet'
import DevicePolicyComponentSet      from './DevicePolicyComponentSet'
import Layer2ComponentSet            from './Layer2ComponentSet'
import Layer3ComponentSet            from './Layer3ComponentSet'


export function AccessControlTabs () {
  const { $t } = useIntl()
  const { accountTier } = getUserProfile()
  const isCore = isCoreTier(accountTier)

  const paddingStyle = { paddingTop: '8px' }

  const [currentTab, setCurrentTab] = useState('accessControlSet')

  const { data: countData } = useWifiAclTotalCount(false)

  const {
    aclCount = 0,
    l2AclCount = 0,
    l3AclCount = 0,
    deviceAclCount = 0,
    appAclCount = 0
  } = countData ?? {}

  const onTabChange = (tab: string) => {
    setCurrentTab(tab)
  }

  return (
    <Tabs onChange={onTabChange} activeKey={currentTab} type='card'>
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Access Control Set ({aclCount})' }, { aclCount })}
        key='accessControlSet'
        style={paddingStyle}
      >
        <AccessControlSet />
      </Tabs.TabPane>
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Layer 2 ({l2AclCount})' }, { l2AclCount })}
        key='layer2'
        style={paddingStyle}
      >
        <Layer2ComponentSet />
      </Tabs.TabPane>
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Layer 3 ({l3AclCount})' }, { l3AclCount })}
        key='layer3'
        style={paddingStyle}
      >
        <Layer3ComponentSet />
      </Tabs.TabPane>
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Device & OS ({deviceAclCount})' }, { deviceAclCount })}
        key='device'
        style={paddingStyle}
      >
        <DevicePolicyComponentSet />
      </Tabs.TabPane>
      {
        !isCore && <Tabs.TabPane
          tab={$t({ defaultMessage: 'Applications ({appAclCount})' }, { appAclCount })}
          key='application'
          style={paddingStyle}
        >
          <ApplicationPolicyComponentSet />
        </Tabs.TabPane>
      }
    </Tabs>
  )
}

export default AccessControlTabs
