import { useState } from 'react'

import { useIntl } from 'react-intl'

import { Tabs } from '@acx-ui/components'

import ApFirmware     from './ApFirmware'
import SwitchFirmware from './SwitchFirmware'

const FWVersionMgmt = () => {
  const { $t } = useIntl()

  const [currentTab, setCurrentTab] = useState('apFirmware')

  const onTabChange = (tab: string) => {
    setCurrentTab(tab)
  }

  return <>
    <Tabs onChange={onTabChange}
      activeKey={currentTab}
      type='third'>
      <Tabs.TabPane tab={$t({ defaultMessage: 'AP Firmware' })} key='apFirmware' />
      <Tabs.TabPane tab={$t({ defaultMessage: 'Switch Firmware' })} key='switchFirmware' />
    </Tabs>
    <div style={{ display: currentTab === 'apFirmware' ? 'block' : 'none' }}>
      <ApFirmware />
    </div>
    <div style={{ display: currentTab === 'switchFirmware' ? 'block' : 'none' }}>
      <SwitchFirmware />
    </div>
  </>
}

export default FWVersionMgmt
