import { useState } from 'react'

import { useIntl } from 'react-intl'

import { Tabs }                                        from '@acx-ui/components'
import { Features, useIsSplitOn }                      from '@acx-ui/feature-toggle'
import { useGetEnhancedAccessControlProfileListQuery } from '@acx-ui/rc/services'
import { useTableQuery }                               from '@acx-ui/rc/utils'
import { getUserProfile, isCoreTier }                  from '@acx-ui/user'

import AccessControlSet              from './AccessControlSet'
import ApplicationPolicyComponentSet from './ApplicationPolicyComponentSet'
import DevicePolicyComponentSet      from './DevicePolicyComponentSet'
import Layer2ComponentSet            from './Layer2ComponentSet'
import Layer3ComponentSet            from './Layer3ComponentSet'


const defaultPayload = {
  searchString: '',
  fields: [
    'id',
    'name'
  ]
}

export function AccessControlTabs () {
  const { $t } = useIntl()
  const { accountTier } = getUserProfile()
  const isCore = isCoreTier(accountTier)

  const paddingStyle = { paddingTop: '8px' }

  const [currentTab, setCurrentTab] = useState('accessControlSet')

  const enableRbac = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)

  const onTabChange = (tab: string) => {
    setCurrentTab(tab)
  }

  const tableQuery = useTableQuery({
    useQuery: useGetEnhancedAccessControlProfileListQuery,
    defaultPayload: {
      ...defaultPayload,
      noDetails: true
    },
    enableRbac
  })

  return (
    <Tabs onChange={onTabChange} activeKey={currentTab} type='card'>
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Access Control Set ({aclCount})' }, {
          aclCount: tableQuery?.data?.totalCount
        })}
        key='accessControlSet'
        style={paddingStyle}
      >
        <AccessControlSet />
      </Tabs.TabPane>
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Layer 2' })}
        key='layer2'
        style={paddingStyle}
      >
        <Layer2ComponentSet />
      </Tabs.TabPane>
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Layer 3' })}
        key='layer3'
        style={paddingStyle}
      >
        <Layer3ComponentSet />
      </Tabs.TabPane>
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Device & OS' })}
        key='device'
        style={paddingStyle}
      >
        <DevicePolicyComponentSet />
      </Tabs.TabPane>
      {
        !isCore && <Tabs.TabPane
          tab={$t({ defaultMessage: 'Applications' })}
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
