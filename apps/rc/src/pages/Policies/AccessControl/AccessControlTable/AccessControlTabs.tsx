import { useState } from 'react'

import { useIntl } from 'react-intl'

import { Tabs }                      from '@acx-ui/components'
import { usePolicyListQuery }        from '@acx-ui/rc/services'
import { PolicyType, useTableQuery } from '@acx-ui/rc/utils'

import AccessControlSet           from './AccessControlSet'
import ApplicationPolicyComponent from './ApplicationPolicyComponent'
import DevicePolicyComponent      from './DevicePolicyComponent'
import Layer2Component            from './Layer2Component'
import Layer3Component            from './Layer3Component'


const defaultPayload = {
  searchString: '',
  filters: {
    type: [PolicyType.ACCESS_CONTROL]
  },
  fields: [
    'id',
    'name',
    'type',
    'scope',
    'cog'
  ]
}

function AccessControlTabs () {
  const { $t } = useIntl()

  const [currentTab, setCurrentTab] = useState('accessControlSet')

  const onTabChange = (tab: string) => {
    setCurrentTab(tab)
  }

  const tableQuery = useTableQuery({
    useQuery: usePolicyListQuery,
    defaultPayload
  })

  return (
    <Tabs onChange={onTabChange} activeKey={currentTab}>
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Access Control Set ({aclCount})' }, {
          aclCount: tableQuery?.data?.totalCount
        })}
        key='accessControlSet'
      >
        <AccessControlSet />
      </Tabs.TabPane>
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Layer 2' })}
        key='layer2'
      >
        <Layer2Component />
      </Tabs.TabPane>
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Layer 3' })}
        key='layer3'
      >
        <Layer3Component />
      </Tabs.TabPane>
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Device & OS' })}
        key='device'
      >
        <DevicePolicyComponent />
      </Tabs.TabPane>
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Applications' })}
        key='application'
      >
        <ApplicationPolicyComponent />
      </Tabs.TabPane>
    </Tabs>
  )
}

export default AccessControlTabs
