import React, { useState } from 'react'

import { NetworkSaveData } from '@acx-ui/rc/utils'

import BodyOfMoreSettingsForm from './BodyOfMoreSettingsForm'
import TabSwitcher            from './TabSwitcher'

interface MoreSettingsFormProps {
  wlanData: NetworkSaveData | null;
}

function MoreSettingsForm ({ wlanData }: MoreSettingsFormProps) {
  const tabs: string[] = [
    // eslint-disable-next-line max-len
    'VLAN', 'Network Control' , 'Radio' , 'Networking' ,'Radius Options' , 'User Connection' , 'Advanced'
  ]

  const [selectedTabValue, setSelectedTabValue] = useState<string>(tabs[0])

  const handleSelectedTabValueChange = (selectedTabValue: string): void => {
    setSelectedTabValue(selectedTabValue)
  }


  return (
    <>
      <TabSwitcher
        data-testid='TabSwitcher'
        handleSelectedTabValueChange={handleSelectedTabValueChange}
        defaultValue={selectedTabValue}
      />
      <BodyOfMoreSettingsForm
        data-testid='BodyOfMoreSettingsForm'
        selectedTabValue={selectedTabValue}
        wlanData={wlanData}
      />
    </>
  )
}


export default MoreSettingsForm