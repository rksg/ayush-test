import { useState } from 'react'

import { useIntl } from 'react-intl'

import { Tabs }                                        from '@acx-ui/components'
import { useGetEnhancedAccessControlProfileListQuery } from '@acx-ui/rc/services'
import { useTableQuery }                               from '@acx-ui/rc/utils'

import AccessControlSet           from './AccessControlSet'
import ApplicationPolicyComponent from './ApplicationPolicyComponent'
import DevicePolicyComponent      from './DevicePolicyComponent'
import Layer2Component            from './Layer2Component'
import Layer3Component            from './Layer3Component'


const defaultPayload = {
  searchString: '',
  fields: [
    'id',
    'name'
  ]
}

function AccessControlTabs () {
  const { $t } = useIntl()
  const paddingStyle = { paddingTop: '8px' }

  const [currentTab, setCurrentTab] = useState('accessControlSet')

  const onTabChange = (tab: string) => {
    setCurrentTab(tab)
  }

  const tableQuery = useTableQuery({
    useQuery: useGetEnhancedAccessControlProfileListQuery,
    defaultPayload
  })

  return (
    <Tabs onChange={onTabChange} activeKey={currentTab}>
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
        <Layer2Component />
      </Tabs.TabPane>
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Layer 3' })}
        key='layer3'
        style={paddingStyle}
      >
        <Layer3Component />
      </Tabs.TabPane>
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Device & OS' })}
        key='device'
        style={paddingStyle}
      >
        <DevicePolicyComponent />
      </Tabs.TabPane>
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Applications' })}
        key='application'
        style={paddingStyle}
      >
        <ApplicationPolicyComponent />
      </Tabs.TabPane>
    </Tabs>
  )
}

export default AccessControlTabs
