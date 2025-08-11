import { useEffect, useState } from 'react'
import { createContext }       from 'react'

import { useIntl } from 'react-intl'


import { Tabs, Loader }                          from '@acx-ui/components'
import { Olt, OltCage }                          from '@acx-ui/olt/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import { oltData, oltCageList } from '../mockdata'

import { OltDetailPageHeader } from './OltDetailPageHeader'
import { OltInfoWidget }       from './OltInfoWidget'
import { OltLineCardTab }      from './OltLineCardTab'
import { OltNetworkCardTab }   from './OltNetworkCardTab'
import { OltOverviewTab }      from './OltOverviewTab'

enum OverviewInfoType {
  OVERVIEW = 'overview',
  NETWORK = 'network',
  LINE = 'line'
}

export const OltDetailsContext = createContext({} as {
  oltDetailsContextData: Olt
})

export const OltDetails = () => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const { activeTab, oltId } = useParams()
  const basePath = useTenantLink(`/devices/optical/${oltId}/details/`)

  const oltDetails = oltData as Olt //TODO: temp, remove when api is ready
  const oltCages = oltCageList as OltCage[] //TODO: temp, remove when api is ready

  const [currentTab, setCurrentTab] = useState<string | undefined>(undefined)

  const handleTabChange = (tab: string) => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  }

  useEffect(() => {
    if (activeTab && Object.values(OverviewInfoType).includes(activeTab as OverviewInfoType))
      setCurrentTab(activeTab)
  }, [activeTab])

  const tabs = [{
    label: $t({ defaultMessage: 'Overview' }),
    value: OverviewInfoType.OVERVIEW,
    children: <OltOverviewTab />
  }, {
    label: $t({ defaultMessage: 'Network Card' }),
    value: OverviewInfoType.NETWORK,
    children: <OltNetworkCardTab />
  }, {
    label: $t({ defaultMessage: 'Line Card' }),
    value: OverviewInfoType.LINE,
    children: <OltLineCardTab
      oltDetails={oltDetails}
      oltCages={oltCages}
      isLoading={false}
      isFetching={false}
    />
  }]

  return <OltDetailsContext.Provider value={{
    oltDetailsContextData: oltDetails
  }}>
    <OltDetailPageHeader
      oltDetails={oltDetails}
    />
    <OltInfoWidget
      oltDetails={oltDetails}
      oltCages={oltCages}
      isLoading={false}
      isFetching={false}
    />
    <Tabs type='card'
      activeKey={currentTab}
      defaultActiveKey={currentTab || tabs[0].value}
      onChange={handleTabChange}
    >
      {tabs.map((tab) => (
        <Tabs.TabPane
          tab={tab.label}
          key={tab.value}
        >
          <Loader
            // states={[{ isLoading: isCagesLoading, isFetching: isCagesFetching }]}
            style={{ minHeight: '100px' }}
          >
            {tab.children}
          </Loader>
        </Tabs.TabPane>
      ))}
    </Tabs>
  </OltDetailsContext.Provider>
}