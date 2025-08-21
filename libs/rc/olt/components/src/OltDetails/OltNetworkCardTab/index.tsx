import { useState } from 'react'

import { useIntl } from 'react-intl'

import { Tabs }                   from '@acx-ui/components'
import {  oltNetworkCardOptions } from '@acx-ui/olt/utils'

import { OltOobPortTable }    from '../OltOobPortTable'
import { OltUplinkPortTable } from '../OltUplinkPortTable'


export const OltNetworkCardTab = () => {
  const { $t } = useIntl()
  const [activeKey, setActiveKey] = useState<string>(oltNetworkCardOptions[0].value)

  const handleTabChange = (val: string) => {
    setActiveKey(val)
  }

  const tabs = [{
    label: $t({ defaultMessage: 'Uplink' }),
    value: 'uplink',
    children: <OltUplinkPortTable />
  }, {
    label: $t({ defaultMessage: 'OOB' }),
    value: 'oob',
    children: <OltOobPortTable />
  }]

  return <Tabs
    type='third'
    activeKey={activeKey}
    onChange={handleTabChange}>
    {tabs.map((tab) => (
      <Tabs.TabPane
        tab={tab.label}
        key={tab.value}
      >
        {tab.children}
      </Tabs.TabPane>
    ))}
  </Tabs>
}