/* eslint-disable max-len */
import { createContext, useEffect, useState } from 'react'

import _                          from 'lodash'
import { useIntl }                from 'react-intl'
import { useNavigate, useParams } from 'react-router-dom'

import { showActionModal }                                                      from '@acx-ui/components'
import { Features, useIsSplitOn }                                               from '@acx-ui/feature-toggle'
import { useSwitchDetailHeaderQuery, useGetSwitchQuery, useGetSwitchListQuery } from '@acx-ui/rc/services'
import { isStrictOperationalSwitch, Switch, SwitchStatusEnum, SwitchViewModel } from '@acx-ui/rc/utils'
import { UseQueryResult }                                                       from '@acx-ui/types'
import { getUserProfile, goToNotFound, hasRaiPermission, isCoreTier }           from '@acx-ui/user'
import { TABLE_QUERY_LONG_POLLING_INTERVAL }                                    from '@acx-ui/utils'

import { SwitchClientsTab }         from './SwitchClientsTab'
import { SwitchConfigurationTab }   from './SwitchConfigurationTab'
import { SwitchDhcpTab }            from './SwitchDhcpTab'
import { SwitchIncidentsTab }       from './SwitchIncidentsTab'
import { SwitchOverviewTab }        from './SwitchOverviewTab'
import SwitchPageHeader             from './SwitchPageHeader'
import { SwitchTimelineTab }        from './SwitchTimelineTab'
import { SwitchTroubleshootingTab } from './SwitchTroubleshootingTab'


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
  const { $t } = useIntl()
  const { accountTier } = getUserProfile()
  const isCore = isCoreTier(accountTier)
  const navigate = useNavigate()

  const tabs = {
    overview: SwitchOverviewTab,
    incidents: () => ( hasRaiPermission('READ_INCIDENTS') && !isCore) ? <SwitchIncidentsTab/> : null,
    troubleshooting: SwitchTroubleshootingTab,
    clients: SwitchClientsTab,
    configuration: SwitchConfigurationTab,
    dhcp: SwitchDhcpTab,
    timeline: SwitchTimelineTab
  }

  const isSwitchRbacEnabled = useIsSplitOn(Features.SWITCH_RBAC_API)

  const [switchDetailsContextData, setSwitchDetailsContextData] = useState({} as SwitchDetails)
  const [venueId, setVenueId] = useState('')

  const getSwitchList =
  useGetSwitchListQuery({ params: { tenantId },
    payload: { filters: { id: [switchId || serialNumber] } }, enableRbac: isSwitchRbacEnabled }, {
    skip: !isSwitchRbacEnabled
  })

  const switchDetailHeaderQuery = useSwitchDetailHeaderQuery({
    params: { tenantId, switchId, serialNumber, venueId },
    enableRbac: isSwitchRbacEnabled
  }, {
    pollingInterval: TABLE_QUERY_LONG_POLLING_INTERVAL,
    skip: isSwitchRbacEnabled && _.isEmpty(venueId)
  })
  const switchQuery = useGetSwitchQuery({
    params: { tenantId, switchId, venueId },
    enableRbac: isSwitchRbacEnabled
  }, {
    pollingInterval: TABLE_QUERY_LONG_POLLING_INTERVAL,
    skip: isSwitchRbacEnabled && _.isEmpty(venueId)
  })

  const { data: switchDetailHeader } = switchDetailHeaderQuery
  const { data: switchData } = switchQuery


  useEffect(() => {
    if(getSwitchList.data) {
      if(getSwitchList.data.data.length === 0){
        showActionModal({
          type: 'info',
          title: $t({ defaultMessage: 'Switch No Longer Available' }),
          content: $t({ defaultMessage: 'The switch is no longer available. It may have been deleted by you. Click "OK" to return to the previous page.' }),
          okText: $t({ defaultMessage: 'OK' }),
          onOk: async () => { navigate(-1) }
        })
      } else {
        setVenueId(getSwitchList.data.data[0]?.venueId)
      }
    }
  }, [getSwitchList])

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

  const Tab = tabs[activeTab as keyof typeof tabs] || goToNotFound

  return <SwitchDetailsContext.Provider value={{
    switchDetailsContextData,
    setSwitchDetailsContextData
  }}>
    <SwitchPageHeader />
    { Tab && <Tab /> }
  </SwitchDetailsContext.Provider>
}
