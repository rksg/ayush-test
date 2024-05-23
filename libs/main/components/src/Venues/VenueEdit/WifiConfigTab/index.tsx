import { createContext, useContext } from 'react'

import { useIntl } from 'react-intl'

import { Tabs }                                                                   from '@acx-ui/components'
import { Features, useIsSplitOn }                                                 from '@acx-ui/feature-toggle'
import { usePathBasedOnConfigTemplate }                                           from '@acx-ui/rc/components'
import { useGetVenueApCapabilitiesQuery, useGetVenueTemplateApCapabilitiesQuery } from '@acx-ui/rc/services'
import { Capabilities }                                                           from '@acx-ui/rc/utils'
import { useNavigate, useParams }                                                 from '@acx-ui/react-router-dom'

import { useVenueConfigTemplateQueryFnSwitcher } from '../../venueConfigTemplateApiSwitcher'
import { VenueEditContext, EditContext }         from '../index'

import { AdvancedTab }   from './AdvancedTab'
import { NetworkingTab } from './NetworkingTab'
import { RadioTab }      from './RadioTab/RadioTab'
import { SecurityTab }   from './SecurityTab'
import { ServerTab }     from './ServerTab'


export const VenueUtilityContext = createContext({} as {
  venueApCaps: Capabilities | undefined,
  isLoadingVenueApCaps: boolean
})

export function WifiConfigTab () {
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const basePath = usePathBasedOnConfigTemplate(`/venues/${params.venueId}/edit/wifi/`)
  const { editContextData, setEditContextData } = useContext(VenueEditContext)

  const isUseRbacApi = useIsSplitOn(Features.WIFI_RBAC_API)

  const { data: venueApCaps, isLoading: isLoadingVenueApCaps } =
    useVenueConfigTemplateQueryFnSwitcher<Capabilities>({
      useQueryFn: useGetVenueApCapabilitiesQuery,
      useTemplateQueryFn: useGetVenueTemplateApCapabilitiesQuery,
      enableRbac: isUseRbacApi,
      enableTemplateRbac: false
    })

  const onTabChange = (tab: string) => {
    const activeSubTab = params?.activeSubTab as keyof EditContext['tempData']
    setEditContextData({
      ...editContextData,
      tabKey: activeSubTab,
      newData: undefined,
      oldData: undefined,
      tempData: {
        ...editContextData.tempData,
        [activeSubTab]: editContextData.newData
      }
    })
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  }

  const tabTitleMap = (tabkey: string) => {
    const tabTitle = {
      radio: $t({ defaultMessage: 'Radio' }),
      networking: $t({ defaultMessage: 'Networking' }),
      security: $t({ defaultMessage: 'Security' }),
      servers: $t({ defaultMessage: 'Network Control' }),
      settings: $t({ defaultMessage: 'Advanced' })
    }

    const title = tabTitle[tabkey as keyof typeof tabTitle]
    return editContextData.isDirty && params?.activeSubTab === tabkey
      ? `${title} *` : title
  }

  return (
    <VenueUtilityContext.Provider value={{
      venueApCaps,
      isLoadingVenueApCaps
    }}>
      <Tabs
        onChange={onTabChange}
        defaultActiveKey='radio'
        activeKey={params.activeSubTab}
        type='card'
      >
        <Tabs.TabPane tab={tabTitleMap('radio')} key='radio'>
          <RadioTab />
        </Tabs.TabPane>
        <Tabs.TabPane tab={tabTitleMap('networking')} key='networking'>
          <NetworkingTab />
        </Tabs.TabPane>
        <Tabs.TabPane tab={tabTitleMap('security')} key='security'>
          <SecurityTab />
        </Tabs.TabPane>
        <Tabs.TabPane
          disabled={!useIsSplitOn(Features.POLICIES)}
          tab={tabTitleMap('servers')}
          key='servers'
        >
          <ServerTab />
        </Tabs.TabPane>
        <Tabs.TabPane tab={tabTitleMap('settings')} key='settings'>
          <AdvancedTab />
        </Tabs.TabPane>
      </Tabs>
    </VenueUtilityContext.Provider>
  )
}
