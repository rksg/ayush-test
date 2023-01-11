/* eslint-disable max-len */
import { createContext, useEffect, useState } from 'react'

import { useParams } from 'react-router-dom'

import { useSwitchDetailHeaderQuery }                                   from '@acx-ui/rc/services'
import { isStrictOperationalSwitch, SwitchStatusEnum, SwitchViewModel } from '@acx-ui/rc/utils'

import { SwitchClientsTab }         from './SwitchClientsTab'
import { SwitchConfigurationTab }   from './SwitchConfigurationTab'
import { SwitchDhcpTab }            from './SwitchDhcpTab'
import { SwitchIncidentsTab }       from './SwitchIncidentsTab'
import { SwitchOverviewTab }        from './SwitchOverviewTab'
import SwitchPageHeader             from './SwitchPageHeader'
import { SwitchReportsTab }         from './SwitchReportsTab'
import { SwitchTimelineTab }        from './SwitchTimelineTab'
import { SwitchTroubleshootingTab } from './SwitchTroubleshootingTab'

const tabs = {
  overview: SwitchOverviewTab,
  incidents: SwitchIncidentsTab,
  troubleshooting: SwitchTroubleshootingTab,
  reports: SwitchReportsTab,
  clients: SwitchClientsTab,
  configuration: SwitchConfigurationTab,
  dhcp: SwitchDhcpTab,
  timeline: SwitchTimelineTab
}

export interface SwitchDetails {
  switchDetailHeader: SwitchViewModel
  currentSwitchOperational: boolean
  switchName: string
}

export const SwitchDetailsContext = createContext({} as {
  switchDetailsContextData: SwitchDetails,
  setSwitchDetailsContextData: (data: SwitchDetails) => void
})

export default function SwitchDetails () {
  const { tenantId, switchId, serialNumber, activeTab } = useParams()
  const [ switchDetailsContextData, setSwitchDetailsContextData ] = useState({} as SwitchDetails)
  const { data: switchDetailHeader } = useSwitchDetailHeaderQuery({ params: { tenantId, switchId, serialNumber } })

  useEffect(() => {
    setSwitchDetailsContextData({
      switchDetailHeader: switchDetailHeader as SwitchViewModel,
      switchName: switchDetailHeader?.name || switchDetailHeader?.switchName || switchDetailHeader?.serialNumber || '',
      currentSwitchOperational: isStrictOperationalSwitch(
        switchDetailHeader?.deviceStatus as SwitchStatusEnum, !!switchDetailHeader?.configReady
        , !!switchDetailHeader?.syncedSwitchConfig) && !switchDetailHeader?.suspendingDeployTime
    })
  }, [switchDetailHeader])

  const Tab = tabs[activeTab as keyof typeof tabs]

  return <SwitchDetailsContext.Provider value={{
    switchDetailsContextData,
    setSwitchDetailsContextData
  }}>
    <SwitchPageHeader />
    { Tab && <Tab /> }
  </SwitchDetailsContext.Provider>
}