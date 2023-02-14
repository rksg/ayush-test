import { useState } from 'react'

import { useIntl } from 'react-intl'

import { Tabs }                      from '@acx-ui/components'
import { usePolicyListQuery }        from '@acx-ui/rc/services'
import { PolicyType, useTableQuery } from '@acx-ui/rc/utils'

import AccessControlSet from './AccessControlSet'
import Layer2           from './Layer2'


const defaultPayload = {
  searchString: '',
  filters: {
    type: [PolicyType.ACCESS_CONTROL]
  },
  fields: [
    '*'
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
        <Layer2 />
      </Tabs.TabPane>
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Layer 3' })}
        key='layer3'
      />
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Device & OS' })}
        key='device'
      />
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Applications' })}
        key='application'
      />
    </Tabs>
  )
}

export default AccessControlTabs
