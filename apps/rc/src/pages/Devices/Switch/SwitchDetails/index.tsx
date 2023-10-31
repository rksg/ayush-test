/* eslint-disable max-len */
import { createContext, useEffect, useState } from 'react'

import { useParams } from 'react-router-dom'

import { useSwitchDetailHeaderQuery, useGetSwitchQuery }                        from '@acx-ui/rc/services'
import { isStrictOperationalSwitch, Switch, SwitchStatusEnum, SwitchViewModel } from '@acx-ui/rc/utils'
import { UseQueryResult }                                                       from '@acx-ui/types'
import { hasAccess }                                                            from '@acx-ui/user'
import { TABLE_QUERY_LONG_POLLING_INTERVAL }                                    from '@acx-ui/utils'

import { SwitchClientsTab }         from './SwitchClientsTab'
import { SwitchConfigurationTab }   from './SwitchConfigurationTab'
import { SwitchDhcpTab }            from './SwitchDhcpTab'
import { SwitchIncidentsTab }       from './SwitchIncidentsTab'
import { SwitchOverviewTab }        from './SwitchOverviewTab'
import SwitchPageHeader             from './SwitchPageHeader'
import { SwitchTimelineTab }        from './SwitchTimelineTab'
import { SwitchTroubleshootingTab } from './SwitchTroubleshootingTab'

const tabs = {
  overview: SwitchOverviewTab,
  incidents: () => hasAccess() ? <SwitchIncidentsTab/> : null,
  troubleshooting: SwitchTroubleshootingTab,
  clients: SwitchClientsTab,
  configuration: SwitchConfigurationTab,
  dhcp: SwitchDhcpTab,
  timeline: SwitchTimelineTab
}

export interface SwitchDetails {
  switchData?: Switch
  switchQuery: UseQueryResult<Switch>
  switchDetailHeader: SwitchViewModel
  switchDetailViewModelQuery: UseQueryResult<SwitchViewModel>
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
  const switchDetailHeaderQuery = useSwitchDetailHeaderQuery({
    params: { tenantId, switchId, serialNumber } }, {
    pollingInterval: TABLE_QUERY_LONG_POLLING_INTERVAL
  })
  const switchQuery = useGetSwitchQuery({ params: { tenantId, switchId } }, {
    pollingInterval: TABLE_QUERY_LONG_POLLING_INTERVAL
  })

  const { data: switchDetailHeader } = switchDetailHeaderQuery
  const { data: switchData } = switchQuery

  useEffect(() => {
    setSwitchDetailsContextData({
      switchData: switchData as Switch,
      switchQuery: switchQuery,
      switchDetailHeader: switchDetailHeader as SwitchViewModel,
      switchDetailViewModelQuery: switchDetailHeaderQuery,
      switchName: switchDetailHeader?.name || switchDetailHeader?.switchName || switchDetailHeader?.serialNumber || '',
      currentSwitchOperational: isStrictOperationalSwitch(
        switchDetailHeader?.deviceStatus as SwitchStatusEnum, !!switchDetailHeader?.configReady
        , !!switchDetailHeader?.syncedSwitchConfig) && !switchDetailHeader?.suspendingDeployTime
    })
  }, [switchDetailHeader, switchData])

  const Tab = tabs[activeTab as keyof typeof tabs]

  return <SwitchDetailsContext.Provider value={{
    switchDetailsContextData,
    setSwitchDetailsContextData
  }}>
    <SwitchPageHeader />
    { Tab && <Tab /> }
  </SwitchDetailsContext.Provider>
}