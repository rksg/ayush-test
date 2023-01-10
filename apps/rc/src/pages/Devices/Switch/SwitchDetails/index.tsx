import { useSwitchDetailHeaderQuery } from '@acx-ui/rc/services'
import { isStrictOperationalSwitch, SwitchStatusEnum, SwitchViewModel } from '@acx-ui/rc/utils'
import { createContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

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

export interface SwitchDetailsContext {
  switchDetailHeader: SwitchViewModel
  currentSwitchOperational: boolean
}

export const SwitchDetailsContext = createContext({} as {
  switchDetailsContextData: SwitchDetailsContext,
  setSwitchDetailsContextData: (data: SwitchDetailsContext) => void
})

export default function SwitchDetails () {
  const { tenantId, switchId, serialNumber, activeTab } = useParams()
  const [ switchDetailsContextData, setSwitchDetailsContextData ] = useState({} as SwitchDetailsContext)
  const { data: switchDetailHeader } = useSwitchDetailHeaderQuery({ params: { tenantId, switchId, serialNumber } })

  useEffect(() => {
    setSwitchDetailsContextData({
      switchDetailHeader: switchDetailHeader as SwitchViewModel,
      currentSwitchOperational: isStrictOperationalSwitch(
        switchDetailHeader?.deviceStatus as SwitchStatusEnum, !!switchDetailHeader?.configReady
        , !!switchDetailHeader?.syncedSwitchConfig) && !switchDetailHeader?.suspendingDeployTime
    })
  }, [switchDetailHeader])

  const Tab = tabs[activeTab as keyof typeof tabs]
  
  return <>
   <SwitchDetailsContext.Provider value={{
      switchDetailsContextData,
      setSwitchDetailsContextData
    }}>
    <SwitchPageHeader />
    { Tab && <Tab /> }
    </SwitchDetailsContext.Provider>
    
  </>
}