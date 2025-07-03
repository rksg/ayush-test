import { useState } from 'react'

import { useIntl } from 'react-intl'

import { Tabs }                       from '@acx-ui/components'
import { getUserProfile, isCoreTier } from '@acx-ui/user'

import { useWifiAclTotalCount } from '../counterUtils'

import AccessControlSet           from './AccessControlSet'
import ApplicationPolicyComponent from './ApplicationPolicyComponent'
import DevicePolicyComponent      from './DevicePolicyComponent'
import Layer2Component            from './Layer2Component'
import Layer3Component            from './Layer3Component'


export function AccessControlTabs () {
  const { $t } = useIntl()
  const { accountTier } = getUserProfile()
  const isCore = isCoreTier(accountTier)

  const paddingStyle = { paddingTop: '8px' }

  const [currentTab, setCurrentTab] = useState('accessControlSet')

  // eslint-disable-next-line max-len
  const { aclCount, l2AclCount, l3AclCount, deviceAclCount, appAclCount } = useWifiAclTotalCount(false)

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
        <Layer2Component />
      </Tabs.TabPane>
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Layer 3 ({l3AclCount})' }, { l3AclCount })}
        key='layer3'
        style={paddingStyle}
      >
        <Layer3Component />
      </Tabs.TabPane>
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Device & OS ({deviceAclCount})' }, { deviceAclCount })}
        key='device'
        style={paddingStyle}
      >
        <DevicePolicyComponent />
      </Tabs.TabPane>
      {
        !isCore && <Tabs.TabPane
          tab={$t({ defaultMessage: 'Applications ({appAclCount})' }, { appAclCount })}
          key='application'
          style={paddingStyle}
        >
          <ApplicationPolicyComponent />
        </Tabs.TabPane>
      }
    </Tabs>
  )
}

export default AccessControlTabs
